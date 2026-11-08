import { UsuarioService } from "../services/UsuarioService.js";

export class UsuarioController {
  constructor(usuarioService = new UsuarioService()) {
    this.usuarioService = usuarioService;
  }

  listar = async (req, res, next) => {
    try {
      res.status(200).json(await this.usuarioService.listar());
    } catch (e) {
      next(e);
    }
  };

  obtenerActual = async (req, res, next) => {
    try {
      const userId = req.user?.id || req.headers["x-user-id"];
      res.status(200).json(await this.usuarioService.obtenerActual(userId));
    } catch (e) {
      next(e);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      res.status(200).json(await this.usuarioService.obtenerPorId(req.params.id));
    } catch (e) {
      next(e);
    }
  };
}
