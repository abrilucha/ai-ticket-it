import { MensajeService } from "../services/MensajeService.js";

export class MensajeController {
  constructor(mensajeService = new MensajeService()) {
    this.mensajeService = mensajeService;
  }

  listarPorCompra = async (req, res, next) => {
    try {
      const usuarioActual = req.user;
      const { desde } = req.query;
      const mensajes = await this.mensajeService.listarPorCompra(
        req.params.id,
        usuarioActual,
        { desde }
      );
      res.status(200).json(mensajes);
    } catch (e) {
      next(e);
    }
  };

  enviar = async (req, res, next) => {
    try {
      const usuarioActual = req.user;
      const nuevoMensaje = await this.mensajeService.enviar(
        req.params.id,
        req.body,
        usuarioActual
      );
      res.status(201).json(nuevoMensaje);
    } catch (e) {
      next(e);
    }
  };
}
