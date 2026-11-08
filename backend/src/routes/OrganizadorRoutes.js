import { Router } from "express";
import { OrganizadorController } from "../controllers/OrganizadorController.js";

const router = Router({ mergeParams: true });
const organizadorController = new OrganizadorController();

/**
 * @swagger
 * tags:
 *   name: Organizadores
 *   description: Perfiles públicos y reseñas acumuladas de organizadores
 */

// Contrato Etapa 6: Perfil del organizador (puntajePromedio y cantidadResenas)
router.route("/:id")
  .get((req, res, next) => organizadorController.obtenerPerfil(req, res, next));

// Alias para retrocompatibilidad
router.route("/:id/reputacion")
  .get((req, res, next) => organizadorController.obtenerPerfil(req, res, next));

// Contrato Etapa 6: Reseñas acumuladas del organizador
router.route("/:id/resenas")
  .get((req, res, next) => organizadorController.listarResenas(req, res, next));

export default router;
