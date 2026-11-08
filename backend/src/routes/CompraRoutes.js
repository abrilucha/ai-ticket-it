import { Router } from "express";
import { CompraController } from "../controllers/CompraController.js";
import { MensajeController } from "../controllers/MensajeController.js";
import { ResenaController } from "../controllers/ResenaController.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { CompraSchema } from "../schemas/CompraSchema.js";

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

router.route("/mias")
  .get(requireRole("COMPRADOR"), (req, res, next) => compraController.listarMias(req, res, next));

router.route("/")
  .post(requireRole("COMPRADOR"), validarSchema(CompraSchema), (req, res, next) => compraController.crear(req, res, next));

router.route("/:id")
  .get((req, res, next) => compraController.obtenerPorId(req, res, next));

router.route("/:id/pagar")
  .post(requireRole("COMPRADOR"), (req, res, next) => compraController.pagar(req, res, next));

router.route("/:id/utilizar")
  .post(requireRole("ORGANIZADOR"), (req, res, next) => compraController.utilizar(req, res, next));

router.route("/:id/cancelar")
  .post((req, res, next) => compraController.cancelar(req, res, next));

router.route("/:id/mensajes")
  .get((req, res, next) => mensajeController.listarPorCompra(req, res, next))
  .post((req, res, next) => mensajeController.enviar(req, res, next));

router.route("/:id/resena")
  .get((req, res, next) => resenaController.obtenerPorCompra(req, res, next))
  .post((req, res, next) => resenaController.crear(req, res, next));

export default router;
