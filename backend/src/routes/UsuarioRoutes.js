import { Router } from "express";
import { usuarioController } from "../controllers/UsuarioController.js";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     summary: Obtiene el perfil del usuario actual autenticado
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Usuario actual obtenido exitosamente
 *       401:
 *         description: No autenticado
 */
router.route("/me")
  .get((req, res, next) => usuarioController.obtenerActual(req, res, next))
  .put((req, res, next) => usuarioController.actualizarActual(req, res, next));

export default router;
