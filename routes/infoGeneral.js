// routes/infoGeneralCtrl.js
const express = require('express');
const router = express.Router();
const infoGeneralCtrl = require('../controllers/infoGeneralController');
const auth = require('../middlewares/auth');

const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

/**
 * @openapi
 * /api/infoGeneral:
 *   get:
 *     summary: Obtiene todas las mediciones de info general (público) con filtros opcionales
 *     tags:
 *       - InfoGeneral
 *     parameters:
 *       - in: query
 *         name: sondaId
 *         required: false
 *         schema: { type: string }
 *         description: Filtrar por ID de sonda (opcional)
 *       - in: query
 *         name: from
 *         required: false
 *         schema: { type: string }
 *         description: Fecha/hora inicio ISO8601 (opcional)
 *       - in: query
 *         name: to
 *         required: false
 *         schema: { type: string }
 *         description: Fecha/hora fin ISO8601 (opcional)
 *     responses:
 *       200:
 *         description: Lista de mediciones
 */
router.get('/', infoGeneralCtrl.getAll)
/**
 * @openapi
 * /api/infoGeneral/stats/min:
 *   get:
 *     summary: Mínimo de temperaturaReal en un intervalo
 *     tags: [InfoGeneral]
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
router.get('/stats/min', infoGeneralCtrl.min);

/**
 * @openapi
 * /api/infoGeneral/stats/max:
 *   get:
 *     summary: Máximo de temperaturaReal en un intervalo
 *     tags: [InfoGeneral]
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
router.get('/stats/max', infoGeneralCtrl.max);

/**
 * @openapi
 * /api/infoGeneral/stats/avg:
 *   get:
 *     summary: Media de temperaturaReal en un intervalo
 *     tags: [InfoGeneral]
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
router.get('/stats/avg', infoGeneralCtrl.avg);

/**
 * @openapi
 * /api/infoGeneral/stats/median:
 *   get:
 *     summary: Mediana de temperaturaReal en un intervalo
 *     tags: [InfoGeneral]
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
router.get('/stats/median', infoGeneralCtrl.median);

/**
 * @openapi
 * /api/infoGeneral/{id}:
 *   get:
 *     summary: Obtiene una medición de info general por ID (público)
 *     tags:
 *       - InfoGeneral
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoId de la medición
 *     responses:
 *       200:
 *         description: Medición encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/:id', auth, infoGeneralCtrl.getOne);

/**
 * @openapi
 * /api/infoGeneral:
 *   post:
 *     summary: Crea una medición de info general (requiere JWT)
 *     tags:
 *       - InfoGeneral
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [temperaturaReal, sensacionTermica, cubiertaNubes, sonda, timestamp]
 *             properties:
 *               temperaturaReal:
 *                 type: number
 *                 example: 18
 *               sensacionTermica:
 *                 type: number
 *                 example: 17
 *               cubiertaNubes:
 *                 type: string
 *                 example: Soleado despejado
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
    body('temperaturaReal').isNumeric().withMessage('temperaturaReal debe ser número'),
    body('sensacionTermica').isNumeric().withMessage('sensacionTermica debe ser número'),
    body('cubiertaNubes')
      .isIn(['Soleado despejado','Soleado nublado','Lluvia','Nieve','Luna despejada','Luna nublada'])
      .withMessage('cubiertaNubes inválida'),
    body('sonda').isMongoId().withMessage('sonda debe ser MongoId'),
    body('timestamp').isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  infoGeneralCtrl.create
);

/**
 * @openapi
 * /api/infoGeneral/{id}:
 *   put:
 *     summary: Actualiza una medición de info general (requiere JWT)
 *     tags:
 *       - InfoGeneral
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
 *               temperaturaReal:
 *                 type: number
 *               sensacionTermica:
 *                 type: number
 *               cubiertaNubes:
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
    body('temperaturaReal').optional().isNumeric().withMessage('temperaturaReal debe ser número'),
    body('sensacionTermica').optional().isNumeric().withMessage('sensacionTermica debe ser número'),
    body('cubiertaNubes')
      .optional()
      .isIn(['Soleado despejado','Soleado nublado','Lluvia','Nieve','Luna despejada','Luna nublada'])
      .withMessage('cubiertaNubes inválida'),
    body('sonda').optional().isMongoId().withMessage('sonda debe ser MongoId'),
    body('timestamp').optional().isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  infoGeneralCtrl.update
);

/**
 * @openapi
 * /api/infoGeneral/{id}:
 *   delete:
 *     summary: Borra (lógico) una medición de info general (requiere JWT)
 *     tags:
 *       - InfoGeneral
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Medición eliminada (borrado lógico)
 *       401:
 *         description: Token requerido
 *       404:
 *         description: No encontrada
 */
router.delete('/:id', auth, infoGeneralCtrl.remove);

module.exports = router;
