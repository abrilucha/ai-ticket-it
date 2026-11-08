import { Router } from "express";
import { CategoriaController } from "../controllers/CategoriaController.js";

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
 */
router.route("/")
  .get((req, res, next) => categoriaController.listar(req, res, next));

export default router;
