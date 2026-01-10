// routes/users.js
const express = require('express');
const router = express.Router();

const precipitacionCtrl = require('../controllers/precipitacionController');
const auth = require('../middlewares/auth');

const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

// Lecturas públicas

/**
 * @openapi
 * /api/precipitacion:
 *   get:
 *     summary: Obtiene todas las mediciones de precipitación (público) con filtros opcionales
 *     tags:
 *       - Precipitacion
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
 *         description: Lista de mediciones de precipitación
 */
router.get('/', precipitacionCtrl.getAll);


/**
 * @openapi
 * /api/precipitacion/stats/min:
 *   get:
 *     summary: Mínimo en intervalo para precipitación
 *     tags:
 *       - Precipitacion
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
router.get('/stats/min', precipitacionCtrl.min);

/**
 * @openapi
 * /api/precipitacion/stats/max:
 *   get:
 *     summary: Máximo en intervalo para precipitación
 *     tags:
 *       - Precipitacion
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
router.get('/stats/max', precipitacionCtrl.max);

/**
 * @openapi
 * /api/precipitacion/stats/avg:
 *   get:
 *     summary: Media en intervalo para precipitación
 *     tags:
 *       - Precipitacion
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
router.get('/stats/avg', precipitacionCtrl.avg);

/**
 * @openapi
 * /api/precipitacion/stats/median:
 *   get:
 *     summary: Mediana en intervalo para precipitación
 *     tags:
 *       - Precipitacion
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
router.get('/stats/median', precipitacionCtrl.median);


/**
 * @openapi
 * /api/precipitacion/{id}:
 *   get:
 *     summary: Obtiene una medición de precipitación por ID (público)
 *     tags:
 *       - Precipitacion
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
router.get('/:id', precipitacionCtrl.getOne);

// Escrituras protegidas

/**
 * @openapi
 * /api/precipitacion:
 *   post:
 *     summary: Crea una medición de precipitación (requiere JWT)
 *     tags:
 *       - Precipitacion
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, probabilidad, acumulada, sonda, timestamp]
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: Agua
 *               probabilidad:
 *                 type: number
 *                 example: 40
 *               acumulada:
 *                 type: number
 *                 example: 2.5
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
    body('tipo')
      .isIn(['Agua', 'Nieve', 'Granizo'])
      .withMessage('tipo debe ser Agua, Nieve o Granizo'),

    body('probabilidad')
      .isNumeric()
      .withMessage('probabilidad debe ser un número'),

    body('acumulada')
      .isNumeric()
      .withMessage('acumulada debe ser un número'),

    body('sonda')
      .isMongoId()
      .withMessage('sonda debe ser un MongoId válido'),

    body('timestamp')
      .isISO8601()
      .withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  precipitacionCtrl.create
);
/**
 * @openapi
 * /api/precipitacion/{id}:
 *   put:
 *     summary: Actualiza una medición de precipitación (requiere JWT)
 *     tags:
 *       - Precipitacion
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
 *               tipo:
 *                 type: string
 *               probabilidad:
 *                 type: number
 *               acumulada:
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

    body('tipo')
      .optional()
      .isIn(['Agua', 'Nieve', 'Granizo'])
      .withMessage('tipo debe ser Agua, Nieve o Granizo'),

    body('probabilidad')
      .optional()
      .isNumeric()
      .withMessage('probabilidad debe ser un número'),

    body('acumulada')
      .optional()
      .isNumeric()
      .withMessage('acumulada debe ser un número'),

    body('sonda')
      .optional()
      .isMongoId()
      .withMessage('sonda debe ser un MongoId válido'),

    body('timestamp')
      .optional()
      .isISO8601()
      .withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  precipitacionCtrl.update
);

/**
 * @openapi
 * /api/precipitacion/{id}:
 *   delete:
 *     summary: Borra (lógico) una medición de precipitación (requiere JWT)
 *     tags:
 *       - Precipitacion
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
router.delete('/:id', auth, precipitacionCtrl.remove);

module.exports = router;
