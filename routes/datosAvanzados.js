// routes/datosAvanzados.js
const express = require('express');
const router = express.Router();
const datosAvanzadosCtrl = require('../controllers/datosAvanzadosController');
const auth = require('../middlewares/auth');

const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

/**
 * @openapi
 * /api/datosAvanzados:
 *   get:
 *     summary: Obtiene todas las mediciones de datos avanzados (público) con filtros opcionales
 *     tags:
 *       - DatosAvanzados
 *     parameters:
 *       - in: query
 *         name: sondaId
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de mediciones
 */
router.get('/', datosAvanzadosCtrl.getAll);

/**
 * @openapi
 * /api/datosAvanzados/stats/min:
 *   get:
 *     summary: Mínimo de presionAire en un intervalo
 *     tags: [DatosAvanzados]
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
 *       200: { description: Valor mínimo }
 *       404: { description: No hay datos en el intervalo }
 */
router.get('/stats/min', datosAvanzadosCtrl.min);

/**
 * @openapi
 * /api/datosAvanzados/stats/max:
 *   get:
 *     summary: Máximo de presionAire en un intervalo
 *     tags: [DatosAvanzados]
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
 *       200: { description: Valor máximo }
 *       404: { description: No hay datos en el intervalo }
 */
router.get('/stats/max', datosAvanzadosCtrl.max);

/**
 * @openapi
 * /api/datosAvanzados/stats/avg:
 *   get:
 *     summary: Media de presionAire en un intervalo
 *     tags: [DatosAvanzados]
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
 *       200: { description: Valor medio }
 *       404: { description: No hay datos en el intervalo }
 */
router.get('/stats/avg', datosAvanzadosCtrl.avg);

/**
 * @openapi
 * /api/datosAvanzados/stats/median:
 *   get:
 *     summary: Mediana de presionAire en un intervalo
 *     tags: [DatosAvanzados]
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
 *       200: { description: Valor mediano }
 *       404: { description: No hay datos en el intervalo }
 */
router.get('/stats/median', datosAvanzadosCtrl.median);

/**
 * @openapi
 * /api/datosAvanzados/{id}:
 *   get:
 *     summary: Obtiene una medición de datos avanzados por ID (público)
 *     tags:
 *       - DatosAvanzados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Medición encontrada }
 *       404: { description: No encontrada }
 */
router.get('/:id', datosAvanzadosCtrl.getOne);

/**
 * @openapi
 * /api/datosAvanzados:
 *   post:
 *     summary: Crea una medición de datos avanzados (requiere JWT)
 *     tags:
 *       - DatosAvanzados
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [presionAire, indiceUltravioleta, indicePolen, sonda, timestamp]
 *             properties:
 *               presionAire:
 *                 type: number
 *                 example: 1018
 *               indiceUltravioleta:
 *                 type: number
 *                 example: 6
 *               indicePolen:
 *                 type: number
 *                 example: 40
 *               sonda:
 *                 type: string
 *                 example: 64b1234567890abcdef12345
 *               timestamp:
 *                 type: string
 *                 example: 2026-01-05T10:00:00Z
 *     responses:
 *       201: { description: Medición creada }
 *       400: { description: Datos inválidos }
 *       401: { description: Token requerido }
 */
router.post(
  '/',
  auth,
  [
    body('presionAire').isNumeric().withMessage('presionAire debe ser número'),
    body('indiceUltravioleta').isNumeric().withMessage('indiceUltravioleta debe ser número'),
    body('indicePolen').isNumeric().withMessage('indicePolen debe ser número'),
    body('sonda').isMongoId().withMessage('sonda debe ser MongoId'),
    body('timestamp').isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  datosAvanzadosCtrl.create
);

/**
 * @openapi
 * /api/datosAvanzados/{id}:
 *   put:
 *     summary: Actualiza una medición de datos avanzados (requiere JWT)
 *     tags:
 *       - DatosAvanzados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               presionAire:
 *                 type: number
 *               indiceUltravioleta:
 *                 type: number
 *               indicePolen:
 *                 type: number
 *               sonda:
 *                 type: string
 *               timestamp:
 *                 type: string
 *     responses:
 *       200: { description: Medición actualizada }
 *       400: { description: Datos inválidos }
 *       401: { description: Token requerido }
 *       404: { description: No encontrada }
 */
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('presionAire').optional().isNumeric().withMessage('presionAire debe ser número'),
    body('indiceUltravioleta').optional().isNumeric().withMessage('indiceUltravioleta debe ser número'),
    body('indicePolen').optional().isNumeric().withMessage('indicePolen debe ser número'),
    body('sonda').optional().isMongoId().withMessage('sonda debe ser MongoId'),
    body('timestamp').optional().isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  datosAvanzadosCtrl.update
);

/**
 * @openapi
 * /api/datosAvanzados/{id}:
 *   delete:
 *     summary: Borra (lógico) una medición de datos avanzados (requiere JWT)
 *     tags:
 *       - DatosAvanzados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Medición eliminada (borrado lógico) }
 *       401: { description: Token requerido }
 *       404: { description: No encontrada }
 */
router.delete('/:id',auth, datosAvanzadosCtrl.remove);

module.exports = router;
