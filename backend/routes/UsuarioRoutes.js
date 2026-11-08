import { Router } from "express";
import { UsuarioController } from "../src/controllers/UsuarioController.js";

const router = Router({ mergeParams: true });
const usuarioController = new UsuarioController();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión y consulta de usuarios (sesión simulada)
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos los usuarios seed (para selector de usuario en frontend)
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 */
router.route("/")
  .get((req, res, next) => usuarioController.listar(req, res, next));

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     summary: Obtiene el perfil del usuario actual según header x-user-id
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Usuario actual obtenido exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.route("/me")
  .get((req, res, next) => usuarioController.obtenerActual(req, res, next));

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.route("/:id")
  .get((req, res, next) => usuarioController.obtenerPorId(req, res, next));

export default router;
