import { FavoritoService } from "../services/FavoritoService.js";

export class FavoritoController {
  constructor(favoritoService = new FavoritoService()) {
    this.favoritoService = favoritoService;
  }

  listar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.headers["x-user-id"];
      res.status(200).json(await this.favoritoService.listar(usuarioId));
    } catch (e) {
      next(e);
    }
  };

  agregar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.headers["x-user-id"];
      res.status(201).json(await this.favoritoService.agregar(usuarioId, req.params.eventoId));
    } catch (e) {
      next(e);
    }
  };

  quitar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.headers["x-user-id"];
      await this.favoritoService.quitar(usuarioId, req.params.eventoId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
