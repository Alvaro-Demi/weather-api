const request = require('supertest');
const app = require('../app');

describe('Viento', () => {
  let token;
  let sondaId;
  let vientoId;

  beforeAll(async () => {
    // Login admin
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: '1234' });

    token = login.body.token;

    // Crear una sonda para usarla en viento
    const nombreSonda = `sonda_jest_${Date.now()}`;
    const sondaRes = await request(app)
      .post('/api/sondas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: nombreSonda,
        descripcion: 'Sonda creada por Jest',
        localizacion: 'Madrid'
      });

    expect(sondaRes.statusCode).toBe(201);
    sondaId = sondaRes.body._id;
  });

  test('GET /api/viento (sin token) -> 200 (público)', async () => {
    const res = await request(app).get('/api/viento');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/viento (con token) -> 201', async () => {
    const res = await request(app)
      .post('/api/viento')
      .set('Authorization', `Bearer ${token}`)
      .send({
        velocidad: 15,
        rafagas: 25,
        direccion: 'N',
        sonda: sondaId,
        timestamp: new Date().toISOString()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.sonda).toBeDefined();

    vientoId = res.body._id;
  });

  test('GET /api/viento/:id -> 200', async () => {
    const res = await request(app).get(`/api/viento/${vientoId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(vientoId);
  });

  test('PUT /api/viento/:id (con token) -> 200', async () => {
    const res = await request(app)
      .put(`/api/viento/${vientoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ velocidad: 30 });

    expect(res.statusCode).toBe(200);
    expect(res.body.velocidad).toBe(30);
  });

  test('GET /api/viento con filtros por sondaId -> 200', async () => {
    const res = await request(app).get(`/api/viento?sondaId=${sondaId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/viento/stats/avg -> 200 o 404', async () => {
    // Dependiendo de tu implementación puede devolver 404 si no hay datos en rango.
    // Le damos un rango amplio para que encuentre la medición creada.
    const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // ayer
    const to = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();   // mañana

    const res = await request(app).get(`/api/viento/stats/avg?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&sondaId=${sondaId}`);

    expect([200, 404]).toContain(res.statusCode);
  });

  test('DELETE /api/viento/:id (con token) -> 200', async () => {
    const res = await request(app)
      .delete(`/api/viento/${vientoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  test('GET /api/viento/:id (tras delete) -> 404', async () => {
    const res = await request(app).get(`/api/viento/${vientoId}`);
    expect(res.statusCode).toBe(404);
  });
});
