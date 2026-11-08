import { Router } from "express";
import { EventoController } from "../src/controllers/EventoController.js";

const router = Router({ mergeParams: true });
const eventoController = new EventoController();

/**
 * @swagger
 * tags:
 *   name: Eventos
 *   description: Búsqueda, creación y gestión de eventos
 */

/**
 * @swagger
 * /eventos:
 *   get:
 *     summary: Lista y busca eventos con filtros de texto, categoría y ordenamiento
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda textual por nombre o descripción
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [precio, fecha, puntaje]
 *         description: Campo de ordenamiento
 *       - in: query
 *         name: direccion
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Dirección del ordenamiento
 *     responses:
 *       200:
 *         description: Lista de eventos obtenida exitosamente
 *   post:
 *     summary: Crea un nuevo evento con sus tipos de entrada (precio y cupo)
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - categoria
 *               - fecha
 *               - tiposEntrada
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               tiposEntrada:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     precio:
 *                       type: number
 *                     cupo:
 *                       type: integer
 *               multimedia:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 */
router.route("/")
  .get((req, res, next) => eventoController.buscar(req, res, next))
  .post((req, res, next) => eventoController.crear(req, res, next));

/**
 * @swagger
 * /eventos/mios:
 *   get:
 *     summary: Lista los eventos creados por el organizador logueado
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Eventos del organizador obtenidos exitosamente
 */
router.route("/mios")
  .get((req, res, next) => eventoController.listarMios(req, res, next));

/**
 * @swagger
 * /eventos/{id}:
 *   get:
 *     summary: Obtiene el detalle de un evento por ID
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento obtenido exitosamente
 *       404:
 *         description: Evento no encontrado
 *   put:
 *     summary: Actualiza un evento completamente
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento actualizado exitosamente
 *   patch:
 *     summary: Actualiza parcialmente un evento
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento actualizado exitosamente
 *   delete:
 *     summary: Elimina un evento
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Evento eliminado exitosamente
 */
router.route("/:id")
  .get((req, res, next) => eventoController.obtenerPorId(req, res, next))
  .put((req, res, next) => eventoController.actualizar(req, res, next))
  .patch((req, res, next) => eventoController.actualizar(req, res, next))
  .delete((req, res, next) => eventoController.eliminar(req, res, next));

/**
 * @swagger
 * /eventos/{id}/compras:
 *   get:
 *     summary: Lista las compras asociadas al evento y la disponibilidad restante por tipo de entrada
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Compras y disponibilidad obtenidas exitosamente
 *       404:
 *         description: Evento no encontrado
 */
router.route("/:id/compras")
  .get((req, res, next) => eventoController.listarCompras(req, res, next));

/**
 * @swagger
 * /eventos/{id}/resenas:
 *   get:
 *     summary: Lista todas las reseñas del evento
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Reseñas obtenidas exitosamente
 */
router.route("/:id/resenas")
  .get((req, res, next) => eventoController.listarResenas(req, res, next));

export default router;
