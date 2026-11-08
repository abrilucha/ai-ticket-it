import { Router } from "express";
import { OrganizadorController } from "../src/controllers/OrganizadorController.js";

const router = Router({ mergeParams: true });
const organizadorController = new OrganizadorController();

/**
 * @swagger
 * tags:
 *   name: Organizadores
 *   description: Perfiles públicos y reseñas acumuladas de organizadores
 */

/**
 * @swagger
 * /organizadores/{id}:
 *   get:
 *     summary: Obtiene el perfil del organizador con su puntaje promedio
 *     tags: [Organizadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del organizador
 *     responses:
 *       200:
 *         description: Perfil del organizador obtenido exitosamente
 *       404:
 *         description: Organizador no encontrado
 */
router.route("/:id")
  .get((req, res, next) => organizadorController.obtenerPerfil(req, res, next));

/**
 * @swagger
 * /organizadores/{id}/resenas:
 *   get:
 *     summary: Lista todas las reseñas históricas recibidas por los eventos de este organizador
 *     tags: [Organizadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del organizador
 *     responses:
 *       200:
 *         description: Reseñas del organizador obtenidas exitosamente
 */
router.route("/:id/resenas")
  .get((req, res, next) => organizadorController.listarResenas(req, res, next));

export default router;
