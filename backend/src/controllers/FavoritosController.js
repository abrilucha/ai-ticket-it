import { favoritosService as defaultFavoritosService, FavoritosService } from "../services/FavoritosService.js";

export class FavoritosController {
  constructor(favoritosService = defaultFavoritosService || new FavoritosService()) {
    this.favoritosService = favoritosService;
  }

  listar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.headers["x-user-id"];
      const favoritos = await this.favoritosService.listar(usuarioId);
      res.status(200).json(favoritos);
    } catch (e) {
      next(e);
    }
  };

  agregar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.headers["x-user-id"];
      const { eventoId } = req.params;
      const { statusCode, data } = await this.favoritosService.agregar(usuarioId, eventoId);
      res.status(statusCode).json(data);
    } catch (e) {
      next(e);
    }
  };

  quitar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.headers["x-user-id"];
      const { eventoId } = req.params;
      await this.favoritosService.quitar(usuarioId, eventoId);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  };
}

export const favoritosController = new FavoritosController();
