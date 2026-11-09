import { Router } from "express";
import { favoritosController } from "../controllers/FavoritosController.js";

const router = Router();

router
  .route("/")
  .get((req, res, next) => favoritosController.listar(req, res, next));

router
  .route("/:eventoId")
  .post((req, res, next) => favoritosController.agregar(req, res, next))
  .delete((req, res, next) => favoritosController.quitar(req, res, next));

export default router;
