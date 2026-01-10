// routes/users.js
const express = require('express');
const router = express.Router();

const imagenCtrl = require('../controllers/imagenController');
const auth = require('../middlewares/auth');

const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');


// Lecturas públicas

/**
 * @openapi
 * /api/imagen:
 *   get:
 *     summary: Obtiene todas las imágenes (público) con filtros opcionales
 *     tags:
 *       - Imagenes
 *     parameters:
 *       - in: query
 *         name: localizacion
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra por ciudad (opcional)
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
 *         description: Lista de imágenes
 */
router.get('/', imagenCtrl.getAll);

/**
 * @openapi
 * /api/imagen/{id}:
 *   get:
 *     summary: Obtiene una imagen por ID (público)
 *     tags:
 *       - Imagenes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagen encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/:id', imagenCtrl.getOne);

// Escrituras protegidas por auth

/**
 * @openapi
 * /api/imagen:
 *   post:
 *     summary: Crea una imagen (requiere JWT)
 *     tags:
 *       - Imagenes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [localizacion, url, timestamp]
 *             properties:
 *               localizacion:
 *                 type: string
 *                 example: Madrid
 *               url:
 *                 type: string
 *                 example: https://example.com/imagen.jpg
 *               timestamp:
 *                 type: string
 *                 example: 2026-01-02T10:00:00Z
 *     responses:
 *       201:
 *         description: Imagen creada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token requerido
 */
router.post(
  '/',
  auth,
  [
    body('localizacion').isString().notEmpty().withMessage('localizacion obligatoria'),
    body('url').isString().notEmpty().withMessage('url obligatoria'),
    body('timestamp').isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  imagenCtrl.create
);

/**
 * @openapi
 * /api/imagen/{id}:
 *   put:
 *     summary: Actualiza una imagen (requiere JWT)
 *     tags:
 *       - Imagenes
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
 *               localizacion:
 *                 type: string
 *               url:
 *                 type: string
 *               timestamp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Imagen actualizada
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
    body('localizacion').optional().isString().notEmpty().withMessage('localizacion inválida'),
    body('url').optional().isString().notEmpty().withMessage('url inválida'),
    body('timestamp').optional().isISO8601().withMessage('timestamp debe ser ISO8601')
  ],
  validate,
  imagenCtrl.update
);

/**
 * @openapi
 * /api/imagen/{id}:
 *   delete:
 *     summary: Borra (lógico) una imagen (requiere JWT)
 *     tags:
 *       - Imagenes
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
 *         description: Imagen eliminada (borrado lógico)
 *       401:
 *         description: Token requerido
 *       404:
 *         description: No encontrada
 */
router.delete('/:id', auth, imagenCtrl.remove);

module.exports = router;
