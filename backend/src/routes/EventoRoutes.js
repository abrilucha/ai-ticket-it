import { Router } from "express";
import { EventoController } from "../controllers/EventoController.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { requireRole } from "../middlewares/requireRole.js";
import { EventoSchema } from "../schemas/EventoSchema.js";

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
 *   post:
 *     summary: Crea un nuevo evento con sus tipos de entrada (precio y cupo)
 *     tags: [Eventos]
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
 *   put:
 *     summary: Actualiza un evento completamente
 *     tags: [Eventos]
 *   delete:
 *     summary: Elimina un evento
 *     tags: [Eventos]
 */
router.route("/:id")
  .get((req, res, next) => eventoController.getById(req, res, next));

/**
 * @swagger
 * /eventos/{id}/compras:
 *   get:
 *     summary: Lista las compras asociadas al evento y la disponibilidad por tipo de entrada
 *     tags: [Eventos]
 */
router.route("/:id/compras")
  .get(requireRole("ORGANIZADOR"), (req, res, next) => eventoController.listarCompras(req, res, next));

/**
 * @swagger
 * /eventos/{id}/resenas:
 *   get:
 *     summary: Lista todas las reseñas del evento
 *     tags: [Eventos]
 */
router.route("/:id/resenas")
  .get((req, res, next) => eventoController.listarResenas(req, res, next));

export default router;
