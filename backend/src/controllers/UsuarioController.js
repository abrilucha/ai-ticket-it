import { usuarioService as defaultUsuarioService } from "../services/UsuarioService.js";

export class UsuarioController {
  constructor(usuarioService = defaultUsuarioService) {
    this.usuarioService = usuarioService;
  }

  obtenerActual = async (req, res, next) => {
    try {
      const userId = req.user?.id || req.headers["x-user-id"];
      const usuario = await this.usuarioService.obtenerActual(userId);
      if (!usuario) {
        return res.status(404).json({
          error: {
            code: "NO_ENCONTRADO",
            message: "Usuario no encontrado",
          },
          status: "fail",
          statusCode: 404,
          message: "Usuario no encontrado",
        });
      }
      res.status(200).json(usuario);
    } catch (e) {
      next(e);
    }
  };

  actualizarActual = async (req, res, next) => {
    try {
      const userId = req.user?.id || req.headers["x-user-id"];
      const usuarioActualizado = await this.usuarioService.actualizarPerfil(userId, req.body);
      res.status(200).json(usuarioActualizado);
    } catch (e) {
      next(e);
    }
  };
}

export const usuarioController = new UsuarioController();
