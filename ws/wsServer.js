// ws/wsServer.js
// Este archivo se encarga SOLO del servidor WebSocket.
// La idea es que Express siga con sus rutas HTTP, y WebSocket sea "otra capa"
// para notificar eventos en tiempo real.

const { WebSocketServer } = require('ws');

// Guardamos los clientes conectados y su "suscripción" (localización opcional).
// Usamos un Map porque nos permite asociar "ws -> datos del cliente".
const clients = new Map(); // ws -> { location: null | string }

/**
 * Crea el servidor WebSocket y lo engancha al servidor HTTP/HTTPS principal.
 *
 * @param {import('http').Server} server - El servidor Node (el que hace listen).
 * @returns {WebSocketServer}
 */
function createWsServer(server) {
  // "path: '/ws'" significa que el WebSocket estará en:
  // ws://localhost:3000/ws
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Se ejecuta cada vez que un cliente se conecta.
  wss.on('connection', (ws) => {
    // Por defecto, el cliente no filtra por localización (recibe TODO).
    clients.set(ws, { location: null });

    // Mensaje inicial para que el cliente sepa que se conectó correctamente.
    ws.send(
      JSON.stringify({
        type: 'Welcome',
        message:
          'Conectado a AEMET WS correctamente. Puedes suscribirte enviando { "type":"subscribe", "location":"Madrid" }'
      })
    );

    // Cuando el cliente envía un mensaje (normalmente JSON)
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        // Mensaje de suscripción:
        // { type: "subscribe", location: "Madrid" }
        if (msg.type === 'subscribe') {
          const loc = (msg.location || '').trim();

          // Si loc está vacío => null => sin filtro
          clients.set(ws, { location: loc ? loc : null });

          ws.send(
            JSON.stringify({
              type: 'subscribed',
              location: loc || null
            })
          );
        } else {
          // Si llega un tipo que no conocemos, respondemos para depurar
          ws.send(JSON.stringify({ type: 'error', error: 'Tipo de mensaje no soportado' }));
        }
      } catch (e) {
        // Si el cliente envía algo que no es JSON válido
        ws.send(JSON.stringify({ type: 'error', error: 'JSON inválido' }));
      }
    });

    // Cuando el cliente se desconecta, lo quitamos del Map
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  return wss;
}

/**
 * Envía un mensaje a todos los clientes conectados (PUSH),
 * pero respetando la suscripción por localización:
 * - Si el cliente NO tiene location => recibe todo
 * - Si tiene location => solo recibe si coincide con la localización del evento
 *
 * @param {object} payload - Objeto que se enviará al cliente (se convertirá a JSON).
 * @param {string|null} location - Localización del evento (ej: "Madrid"). Si null, se considera global.
 */
function broadcast(payload, location = null) {
  const data = JSON.stringify(payload);

  for (const [ws, meta] of clients.entries()) {
    // Evitamos enviar si el socket no está abierto
    if (ws.readyState !== ws.OPEN) continue;

    // Cliente sin filtro => recibe todo
    if (!meta.location) {
      ws.send(data);
      continue;
    }

    // Cliente con filtro => solo si coincide
    if (location && meta.location.toLowerCase() === location.toLowerCase()) {
      ws.send(data);
    }
  }
}

module.exports = { createWsServer, broadcast };
