import { Router } from "express";
import { CompraController } from "../src/controllers/CompraController.js";
import { MensajeController } from "../src/controllers/MensajeController.js";
import { ResenaController } from "../src/controllers/ResenaController.js";

const router = Router({ mergeParams: true });
const compraController = new CompraController();
const mensajeController = new MensajeController();
const resenaController = new ResenaController();

/**
 * @swagger
 * tags:
 *   name: Compras
 *   description: Gestión de compras, pagos, cancelaciones, mensajes y reseñas asociadas
 */

/**
 * @swagger
 * /compras:
 *   post:
 *     summary: Realiza una nueva compra de entradas para un evento
 *     tags: [Compras]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventoId
 *               - tipoEntradaId
 *               - cantidad
 *             properties:
 *               eventoId:
 *                 type: string
 *               tipoEntradaId:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Compra creada en estado pendiente
 *       400:
 *         description: Cupo no disponible o datos inválidos
 */
router.route("/")
  .post((req, res, next) => compraController.crear(req, res, next));

/**
 * @swagger
 * /compras/mias:
 *   get:
 *     summary: Lista las compras del comprador logueado con estado y días restantes
 *     tags: [Compras]
 *     responses:
 *       200:
 *         description: Lista de compras del usuario obtenida exitosamente
 */
router.route("/mias")
  .get((req, res, next) => compraController.listarMias(req, res, next));

/**
 * @swagger
 * /compras/{id}:
 *   get:
 *     summary: Obtiene el detalle de una compra específica
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compra obtenida exitosamente
 *       404:
 *         description: Compra no encontrada
 */
router.route("/:id")
  .get((req, res, next) => compraController.obtenerPorId(req, res, next));

/**
 * @swagger
 * /compras/{id}/pagar:
 *   post:
 *     summary: Realiza el pago de una compra para pasarla a estado confirmada
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compra pagada y confirmada exitosamente
 */
router.route("/:id/pagar")
  .post((req, res, next) => compraController.pagar(req, res, next));

/**
 * @swagger
 * /compras/{id}/utilizar:
 *   post:
 *     summary: Marca la entrada de la compra como utilizada (ingreso al evento)
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compra marcada como utilizada exitosamente
 */
router.route("/:id/utilizar")
  .post((req, res, next) => compraController.utilizar(req, res, next));

/**
 * @swagger
 * /compras/{id}/cancelar:
 *   post:
 *     summary: Cancela una compra para obtener reembolso si no fue utilizada y el evento no ocurrió
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compra cancelada exitosamente
 *       400:
 *         description: La compra no puede cancelarse
 */
router.route("/:id/cancelar")
  .post((req, res, next) => compraController.cancelar(req, res, next));

/**
 * @swagger
 * /compras/{id}/mensajes:
 *   get:
 *     summary: Lista los mensajes del chat de la compra
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de mensajes obtenida exitosamente
 *   post:
 *     summary: Envía un nuevo mensaje al chat de la compra (comprador u organizador)
 *     tags: [Compras]
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
 *             required:
 *               - mensaje
 *             properties:
 *               mensaje:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mensaje enviado exitosamente
 */
router.route("/:id/mensajes")
  .get((req, res, next) => mensajeController.listarPorCompra(req, res, next))
  .post((req, res, next) => mensajeController.enviar(req, res, next));

/**
 * @swagger
 * /compras/{id}/resena:
 *   get:
 *     summary: Consulta si la compra ya cuenta con reseña
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña obtenida o null si aún no existe
 *   post:
 *     summary: Deja una reseña con puntuación numérica y comentario tras utilizar la entrada
 *     tags: [Compras]
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
 *             required:
 *               - puntuacion
 *               - detalle
 *             properties:
 *               puntuacion:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               detalle:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reseña registrada exitosamente
 *       400:
 *         description: No se puede calificar sin haber utilizado la entrada
 */
router.route("/:id/resena")
  .get((req, res, next) => resenaController.obtenerPorCompra(req, res, next))
  .post((req, res, next) => resenaController.crear(req, res, next));

export default router;
