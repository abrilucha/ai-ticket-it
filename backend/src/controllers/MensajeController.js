import { MensajeService } from "../services/MensajeService.js";

export class MensajeController {
  constructor(mensajeService = new MensajeService()) {
    this.mensajeService = mensajeService;
  }

  listarPorCompra = async (req, res, next) => {
    try {
      const mensajes = await this.mensajeService.listarPorCompra(req.params.id);
      res.status(200).json(mensajes);
    } catch (e) {
      next(e);
    }
  };

  enviar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.headers["x-user-id"];
      const nuevoMensaje = await this.mensajeService.enviar(req.params.id, req.body, usuarioId);
      res.status(201).json(nuevoMensaje);
    } catch (e) {
      next(e);
    }
  };
}
