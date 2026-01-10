const express = require('express');
const router = express.Router();
const sondasCtrl = require('../controllers/sondasController');
const auth = require('../middlewares/auth');

const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');


/**
 * @openapi
 * /api/sondas:
 *   get:
 *     summary: Obtiene todas las sondas (público). Permite filtrar por localización
 *     tags:
 *       - Sondas
 *     parameters:
 *       - in: query
 *         name: localizacion
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra sondas por ciudad (ejemplo Madrid)
 *     responses:
 *       200:
 *         description: Lista de sondas
 */
router.get('/', sondasCtrl.getAll);

/**
 * @openapi
 * /api/sondas/{id}:
 *   get:
 *     summary: Obtiene una sonda por ID (público)
 *     tags:
 *       - Sondas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoId de la sonda
 *     responses:
 *       200:
 *         description: Sonda encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/:id', sondasCtrl.getOne);

/**
 * @openapi
 * /api/sondas:
 *   post:
 *     summary: Crea una sonda (requiere JWT)
 *     tags:
 *       - Sondas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, localizacion]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Sonda-1
 *               descripcion:
 *                 type: string
 *                 example: Sonda de prueba
 *               localizacion:
 *                 type: string
 *                 example: Madrid
 *     responses:
 *       201:
 *         description: Sonda creada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token requerido
 */
router.post(
  '/',
  auth,
  [
    body('nombre').isString().notEmpty().withMessage('nombre obligatorio'),
    body('descripcion').optional().isString(),
    body('localizacion').isString().notEmpty().withMessage('localizacion obligatoria')
  ],
  validate,
  sondasCtrl.create
);

/**
 * @openapi
 * /api/sondas/{id}:
 *   put:
 *     summary: Actualiza una sonda (requiere JWT)
 *     tags:
 *       - Sondas
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
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               localizacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sonda actualizada
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
    body('nombre').optional().isString().notEmpty().withMessage('nombre inválido'),
    body('descripcion').optional().isString(),
    body('localizacion').optional().isString().notEmpty().withMessage('localizacion inválida')
  ],
  validate,
  sondasCtrl.update
);

/**
 * @openapi
 * /api/sondas/{id}:
 *   delete:
 *     summary: Borra (lógico) una sonda (requiere JWT)
 *     tags:
 *       - Sondas
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
 *         description: Sonda eliminada (borrado lógico)
 *       401:
 *         description: Token requerido
 *       404:
 *         description: No encontrada
 */
router.delete('/:id', auth, sondasCtrl.remove);

module.exports = router;
