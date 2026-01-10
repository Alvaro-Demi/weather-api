// routes/calidadAire.js
const express = require('express');
const router = express.Router();
const calidadAireCtrl = require('../controllers/calidadAireController');
const auth = require('../middlewares/auth');

const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

/**
 * @openapi
 * /api/calidadAire:
 *   get:
 *     summary: Obtiene todas las mediciones de calidad del aire (público) con filtros opcionales
 *     tags:
 *       - CalidadAire
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
router.get('/', calidadAireCtrl.getAll);

/**
 * @openapi
 * /api/calidadAire/stats/min:
 *   get:
 *     summary: Mínimo de indice en un intervalo
 *     tags: [CalidadAire]
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
router.get('/stats/min', calidadAireCtrl.min);

/**
 * @openapi
 * /api/calidadAire/stats/max:
 *   get:
 *     summary: Máximo de indice en un intervalo
 *     tags: [CalidadAire]
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
router.get('/stats/max', calidadAireCtrl.max);

/**
 * @openapi
 * /api/calidadAire/stats/avg:
 *   get:
 *     summary: Media de indice en un intervalo
 *     tags: [CalidadAire]
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
router.get('/stats/avg', calidadAireCtrl.avg);

/**
 * @openapi
 * /api/calidadAire/stats/median:
 *   get:
 *     summary: Mediana de indice en un intervalo
 *     tags: [CalidadAire]
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
router.get('/stats/median', calidadAireCtrl.median);

/**
 * @openapi
 * /api/calidadAire/{id}:
 *   get:
 *     summary: Obtiene una medición de calidad del aire por ID (público)
 *     tags:
 *       - CalidadAire
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Medición encontrada }
 *       404: { description: No encontrada }
 */
router.get('/:id', calidadAireCtrl.getOne);

/**
 * @openapi
 * /api/calidadAire:
 *   post:
 *     summary: Crea una medición de calidad del aire (requiere JWT)
 *     tags:
 *       - CalidadAire
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [indice, ozono, particulasPequenas, particulasGrandes, dioxidoNitrogeno, monoxidoCarbono, dioxidoAzufre, sonda, timestamp]
 *             properties:
 *               indice:
 *                 type: number
 *                 example: 44
 *               ozono:
 *                 type: number
 *                 example: 37
 *               particulasPequenas:
 *                 type: number
 *                 example: 3.1
 *               particulasGrandes:
 *                 type: number
 *                 example: 7.4
 *               dioxidoNitrogeno:
 *                 type: number
 *                 example: 1
 *               monoxidoCarbono:
 *                 type: number
 *                 example: 208
 *               dioxidoAzufre:
 *                 type: number
 *                 example: 3
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
    body('indice').isNumeric().withMessage('indice debe ser número'),
    body('ozono').isNumeric().withMessage('ozono debe ser número'),
    body('particulasPequenas').isNumeric().withMessage('particulasPequenas debe ser número'),
    body('particulasGrandes').isNumeric().withMessage('particulasGrandes debe ser número'),
    body('dioxidoNitrogeno').isNumeric().withMessage('dioxidoNitrogeno debe ser número'),
    body('monoxidoCarbono').isNumeric().withMessage('monoxidoCarbono debe ser número'),
    body('dioxidoAzufre').isNumeric().withMessage('dioxidoAzufre debe ser número'),
    body('sonda').isMongoId().withMessage('sonda debe ser MongoId'),
    body('timestamp').isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  calidadAireCtrl.create
);

/**
 * @openapi
 * /api/calidadAire/{id}:
 *   put:
 *     summary: Actualiza una medición de calidad del aire (requiere JWT)
 *     tags:
 *       - CalidadAire
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
 *               indice: { type: number }
 *               ozono: { type: number }
 *               particulasPequenas: { type: number }
 *               particulasGrandes: { type: number }
 *               dioxidoNitrogeno: { type: number }
 *               monoxidoCarbono: { type: number }
 *               dioxidoAzufre: { type: number }
 *               sonda: { type: string }
 *               timestamp: { type: string }
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

    body('indice').optional().isNumeric().withMessage('indice debe ser número'),
    body('ozono').optional().isNumeric().withMessage('ozono debe ser número'),
    body('particulasPequenas').optional().isNumeric().withMessage('particulasPequenas debe ser número'),
    body('particulasGrandes').optional().isNumeric().withMessage('particulasGrandes debe ser número'),
    body('dioxidoNitrogeno').optional().isNumeric().withMessage('dioxidoNitrogeno debe ser número'),
    body('monoxidoCarbono').optional().isNumeric().withMessage('monoxidoCarbono debe ser número'),
    body('dioxidoAzufre').optional().isNumeric().withMessage('dioxidoAzufre debe ser número'),
    body('sonda').optional().isMongoId().withMessage('sonda debe ser MongoId'),
    body('timestamp').optional().isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  calidadAireCtrl.update
);

/**
 * @openapi
 * /api/calidadAire/{id}:
 *   delete:
 *     summary: Borra (lógico) una medición de calidad del aire (requiere JWT)
 *     tags:
 *       - CalidadAire
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
router.delete('/:id',auth, calidadAireCtrl.remove);

module.exports = router;
