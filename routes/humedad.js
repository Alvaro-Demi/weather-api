// routes/humedad.js
const express = require('express');
const router = express.Router();
const humedadCtrl = require('../controllers/humedadController');
const auth = require('../middlewares/auth');

const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');


// Lecturas públicas

/**
 * @openapi
 * /api/humedad:
 *   get:
 *     summary: Obtiene todas las mediciones de humedad (público) con filtros opcionales
 *     tags:
 *       - Humedad
 *     parameters:
 *       - in: query
 *         name: sondaId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por ID de sonda (opcional)
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *         description: Fecha/hora inicio ISO8601 (opcional)
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *         description: Fecha/hora fin ISO8601 (opcional)
 *     responses:
 *       200:
 *         description: Lista de mediciones de humedad
 */
router.get('/', humedadCtrl.getAll);

// Stats públicas (antes de /:id)

/**
 * @openapi
 * /api/humedad/stats/min:
 *   get:
 *     summary: Mínimo en intervalo para humedad
 *     tags:
 *       - Humedad
 *     parameters:
 *       - in: query
 *         name: from
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: sondaId
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Valor mínimo
 *       404:
 *         description: No hay datos en el intervalo
 */
router.get('/stats/min', humedadCtrl.min);

/**
 * @openapi
 * /api/humedad/stats/max:
 *   get:
 *     summary: Máximo en intervalo para humedad
 *     tags:
 *       - Humedad
 *     parameters:
 *       - in: query
 *         name: from
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: sondaId
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Valor máximo
 *       404:
 *         description: No hay datos en el intervalo
 */
router.get('/stats/max', humedadCtrl.max);

/**
 * @openapi
 * /api/humedad/stats/avg:
 *   get:
 *     summary: Media en intervalo para humedad
 *     tags:
 *       - Humedad
 *     parameters:
 *       - in: query
 *         name: from
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: sondaId
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Valor medio
 *       404:
 *         description: No hay datos en el intervalo
 */
router.get('/stats/avg', humedadCtrl.avg);

/**
 * @openapi
 * /api/humedad/stats/median:
 *   get:
 *     summary: Mediana en intervalo para humedad
 *     tags:
 *       - Humedad
 *     parameters:
 *       - in: query
 *         name: from
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: sondaId
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Valor mediano
 *       404:
 *         description: No hay datos en el intervalo
 */
router.get('/stats/median', humedadCtrl.median);

/**
 * @openapi
 * /api/humedad/{id}:
 *   get:
 *     summary: Obtiene una medición de humedad por ID (público)
 *     tags:
 *       - Humedad
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoId de la medición
 *     responses:
 *       200:
 *         description: Medición encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/:id', humedadCtrl.getOne);

// Escrituras protegidas

/**
 * @openapi
 * /api/humedad:
 *   post:
 *     summary: Crea una medición de humedad (requiere JWT)
 *     tags:
 *       - Humedad
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [humedad, puntoRocio, sonda, timestamp]
 *             properties:
 *               humedad:
 *                 type: number
 *                 example: 55
 *               puntoRocio:
 *                 type: number
 *                 example: 12
 *               sonda:
 *                 type: string
 *                 example: 64b1234567890abcdef12345
 *               timestamp:
 *                 type: string
 *                 example: 2026-01-05T10:00:00Z
 *     responses:
 *       201:
 *         description: Medición creada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token requerido
 */
router.post('/', auth, 
[
    body('humedad').isNumeric().withMessage('humedad debe ser número'),
    body('puntoRocio').isNumeric().withMessage('puntoRocio debe ser número'),
    body('sonda').isMongoId().withMessage('sonda debe ser un MongoId válido'),
    body('timestamp').isISO8601().withMessage('timestamp debe ser ISO8601')
],
    validate,
    humedadCtrl.create);

/**
 * @openapi
 * /api/humedad/{id}:
 *   put:
 *     summary: Actualiza una medición de humedad (requiere JWT)
 *     tags:
 *       - Humedad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               humedad:
 *                 type: number
 *               puntoRocio:
 *                 type: number
 *               sonda:
 *                 type: string
 *               timestamp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medición actualizada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token requerido
 *       404:
 *         description: No encontrada
 */
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('humedad').optional().isNumeric().withMessage('humedad debe ser número'),
    body('puntoRocio').optional().isNumeric().withMessage('puntoRocio debe ser número'),
    body('sonda').optional().isMongoId().withMessage('sonda debe ser un MongoId válido'),
    body('timestamp').optional().isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  humedadCtrl.update
);

/**
 * @openapi
 * /api/humedad/{id}:
 *   delete:
 *     summary: Borra (lógico) una medición de humedad (requiere JWT)
 *     tags:
 *       - Humedad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medición eliminada (borrado lógico)
 *       401:
 *         description: Token requerido
 *       404:
 *         description: No encontrada
 */
router.delete('/:id', auth, humedadCtrl.remove);

module.exports = router;
