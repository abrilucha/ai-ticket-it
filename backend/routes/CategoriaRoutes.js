import { Router } from "express";
import { CategoriaController } from "../src/controllers/CategoriaController.js";

const router = Router({ mergeParams: true });
const categoriaController = new CategoriaController();

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Consulta y gestión de categorías de eventos
 */

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Lista todas las categorías disponibles
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
 *   post:
 *     summary: Crea una nueva categoría
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 */
router.route("/")
  .get((req, res, next) => categoriaController.listar(req, res, next))
  .post((req, res, next) => categoriaController.crear(req, res, next));

export default router;
