const express = require('express');
const router = express.Router();
const vientoCtrl = require('../controllers/vientoController');
const auth = require('../middlewares/auth');

const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

/**
 * @openapi
 * /api/viento:
 *   get:
 *     summary: Obtiene todas las mediciones de viento (público) con filtros opcionales
 *     tags:
 *       - Viento
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
 *         description: Lista de mediciones de viento
 */
router.get('/', vientoCtrl.getAll);

/**
 * @openapi
 * /api/viento/stats/min:
 *   get:
 *     summary: Mínimo en intervalo (campo estadístico) para viento
 *     tags:
 *       - Viento
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
router.get('/stats/min', vientoCtrl.min);

/**
 * @openapi
 * /api/viento/stats/max:
 *   get:
 *     summary: Máximo en intervalo (campo estadístico) para viento
 *     tags:
 *       - Viento
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
router.get('/stats/max', vientoCtrl.max);

/**
 * @openapi
 * /api/viento/stats/avg:
 *   get:
 *     summary: Media en intervalo (campo estadístico) para viento
 *     tags:
 *       - Viento
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
router.get('/stats/avg', vientoCtrl.avg);

/**
 * @openapi
 * /api/viento/stats/median:
 *   get:
 *     summary: Mediana en intervalo (campo estadístico) para viento
 *     tags:
 *       - Viento
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
router.get('/stats/median', vientoCtrl.median);

/**
 * @openapi
 * /api/viento/{id}:
 *   get:
 *     summary: Obtiene una medición de viento por ID (público)
 *     tags:
 *       - Viento
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
router.get('/:id', vientoCtrl.getOne);

/**
 * @openapi
 * /api/viento:
 *   post:
 *     summary: Crea una medición de viento (requiere JWT)
 *     tags:
 *       - Viento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [velocidad, rafagas, direccion, sonda, timestamp]
 *             properties:
 *               velocidad:
 *                 type: number
 *                 example: 15
 *               rafagas:
 *                 type: number
 *                 example: 25
 *               direccion:
 *                 type: string
 *                 example: N
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
router.post(
  '/',
  auth,
  [
    body('velocidad').isNumeric().withMessage('velocidad debe ser número'),
    body('rafagas').isNumeric().withMessage('rafagas debe ser número'),
    body('direccion').isIn(['N','NE','E','SE','S','SW','W','NW']).withMessage('direccion inválida'),
    body('sonda').isMongoId().withMessage('sonda debe ser MongoId'),
    body('timestamp').isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  vientoCtrl.create
);

/**
 * @openapi
 * /api/viento/{id}:
 *   put:
 *     summary: Actualiza una medición de viento (requiere JWT)
 *     tags:
 *       - Viento
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
 *               velocidad:
 *                 type: number
 *               rafagas:
 *                 type: number
 *               direccion:
 *                 type: string
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
    body('velocidad').optional().isNumeric().withMessage('velocidad debe ser número'),
    body('rafagas').optional().isNumeric().withMessage('rafagas debe ser número'),
    body('direccion').optional().isIn(['N','NE','E','SE','S','SW','W','NW']).withMessage('direccion inválida'),
    body('sonda').optional().isMongoId().withMessage('sonda debe ser MongoId'),
    body('timestamp').optional().isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  vientoCtrl.update
);

/**
 * @openapi
 * /api/viento/{id}:
 *   delete:
 *     summary: Borra (lógico) una medición de viento (requiere JWT)
 *     tags:
 *       - Viento
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
router.delete('/:id',auth, vientoCtrl.remove);

module.exports = router;
