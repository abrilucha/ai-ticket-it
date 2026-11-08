import { Router } from "express";
import { FavoritoController } from "../src/controllers/FavoritoController.js";

const router = Router({ mergeParams: true });
const favoritoController = new FavoritoController();

/**
 * @swagger
 * tags:
 *   name: Favoritos
 *   description: Gestión de eventos favoritos del usuario
 */

/**
 * @swagger
 * /favoritos:
 *   get:
 *     summary: Lista los eventos marcados como favoritos por el usuario actual
 *     tags: [Favoritos]
 *     responses:
 *       200:
 *         description: Lista de favoritos obtenida exitosamente
 */
router.route("/")
  .get((req, res, next) => favoritoController.listar(req, res, next));

/**
 * @swagger
 * /favoritos/{eventoId}:
 *   post:
 *     summary: Agrega un evento a la lista de favoritos del usuario
 *     tags: [Favoritos]
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       201:
 *         description: Evento agregado a favoritos
 *   delete:
 *     summary: Remueve un evento de la lista de favoritos del usuario
 *     tags: [Favoritos]
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       204:
 *         description: Evento removido de favoritos
 */
router.route("/:eventoId")
  .post((req, res, next) => favoritoController.agregar(req, res, next))
  .delete((req, res, next) => favoritoController.quitar(req, res, next));

export default router;
