// routes/user.js
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const auth = require('../middlewares/auth');

const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

/**
 * @openapi
 * /api/user:
 *   get:
 *     summary: Obtiene todos los usuarios (requiere JWT)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: Token requerido o inválido
 */
router.get('/', auth, userCtrl.getAll);

/**
 * @openapi
 * /api/user/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID (requiere JWT)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoId del usuario
 *     responses:
 *       200:
 *         description: Usuario
 *       404:
 *         description: No encontrado
 *       401:
 *         description: Token requerido o inválido
 */
router.get('/:id',auth, userCtrl.getOne);

/**
 * @openapi
 * /api/user:
 *   post:
 *     summary: Crea un usuario (requiere JWT)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, fullName, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: user_test
 *               fullName:
 *                 type: string
 *                 example: Usuario Test
 *               email:
 *                 type: string
 *                 example: user@test.local
 *               password:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       201:
 *         description: Usuario creado (sin password)
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token requerido o inválido
 *       409:
 *         description: Usuario/email duplicado
 */
router.post(
  '/',
  auth,
  [
    body('username').isString().notEmpty().withMessage('username obligatorio'),
    body('fullName').isString().notEmpty().withMessage('fullName obligatorio'),
    body('email').isEmail().withMessage('email inválido'),
    body('password').isString().notEmpty().withMessage('password obligatorio')
  ],
  validate,
  userCtrl.create
);

/**
 * @openapi
 * /api/user/{id}:
 *   put:
 *     summary: Actualiza un usuario por ID (requiere JWT)
 *     tags:
 *       - Users
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
 *               username:
 *                 type: string
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No encontrado
 *       401:
 *         description: Token requerido o inválido
 */
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('username').optional().isString().notEmpty().withMessage('username inválido'),
    body('fullName').optional().isString().notEmpty().withMessage('fullName inválido'),
    body('email').optional().isEmail().withMessage('email inválido')
  ],
  validate,
  userCtrl.update
);

/**
 * @openapi
 * /api/user/{id}:
 *   delete:
 *     summary: Borra (lógico) un usuario por ID (requiere JWT)
 *     tags:
 *       - Users
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
 *         description: Usuario eliminado (borrado lógico)
 *       404:
 *         description: No encontrado
 *       401:
 *         description: Token requerido o inválido
 */
router.delete('/:id', auth, userCtrl.remove);

module.exports = router;
