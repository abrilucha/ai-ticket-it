import { Router } from "express";
import { EventoController } from "../src/controllers/EventoController.js";
import { validarSchema } from "../src/middlewares/validarSchema.js";
import { requireRole } from "../src/middlewares/requireRole.js";
import { EventoSchema, EventoUpdateSchema } from "../src/schemas/EventoSchema.js";

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
 * /eventos/mios:
 *   get:
 *     summary: Lista los eventos creados por el organizador logueado
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Eventos del organizador obtenidos exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol ORGANIZADOR
 */
router.route("/mios")
  .get(requireRole("ORGANIZADOR"), (req, res, next) => eventoController.listarMios(req, res, next));

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
 *         description: Filtrar por categoría (ID o código)
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [precio, fecha]
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
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *       400:
 *         description: Datos inválidos o fecha pasada (Regla S11)
 *       403:
 *         description: Requiere rol ORGANIZADOR
 */
router.route("/")
  .get((req, res, next) => eventoController.buscar(req, res, next))
  .post(requireRole("ORGANIZADOR"), validarSchema(EventoSchema), (req, res, next) => eventoController.create(req, res, next));

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
 *     responses:
 *       200:
 *         description: Evento obtenido exitosamente
 *       404:
 *         description: Evento no encontrado
 *   put:
 *     summary: Actualiza un evento completamente
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Evento actualizado exitosamente
 *   delete:
 *     summary: Elimina un evento
 *     tags: [Eventos]
 *     responses:
 *       204:
 *         description: Evento eliminado exitosamente
 */
router.route("/:id")
  .get((req, res, next) => eventoController.getById(req, res, next))
  .put(requireRole("ORGANIZADOR"), validarSchema(EventoUpdateSchema), (req, res, next) => eventoController.update(req, res, next))
  .patch(requireRole("ORGANIZADOR"), validarSchema(EventoUpdateSchema), (req, res, next) => eventoController.update(req, res, next))
  .delete(requireRole("ORGANIZADOR"), (req, res, next) => eventoController.delete(req, res, next));

/**
 * @swagger
 * /eventos/{id}/compras:
 *   get:
 *     summary: Lista las compras asociadas al evento y la disponibilidad por tipo de entrada
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Compras y disponibilidad obtenidas exitosamente
 */
router.route("/:id/compras")
  .get(requireRole("ORGANIZADOR"), (req, res, next) => eventoController.listarCompras(req, res, next));

/**
 * @swagger
 * /eventos/{id}/resenas:
 *   get:
 *     summary: Lista todas las reseñas del evento
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Reseñas obtenidas exitosamente
 */
router.route("/:id/resenas")
  .get((req, res, next) => eventoController.listarResenas(req, res, next));

export default router;
