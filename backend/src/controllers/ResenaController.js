import { ResenaService } from "../services/ResenaService.js";

export class ResenaController {
  constructor(resenaService = new ResenaService()) {
    this.mensajeService = resenaService;
    this.resenaService = resenaService;
  }

  crear = async (req, res, next) => {
    try {
      const resena = await this.resenaService.crear(
        req.params.id,
        req.body,
        req.user
      );
      res.status(201).json(resena);
    } catch (e) {
      next(e);
    }
  };

  obtenerPorCompra = async (req, res, next) => {
    try {
      const resena = await this.resenaService.obtenerPorCompra(
        req.params.id,
        req.user
      );
      res.status(200).json(resena);
    } catch (e) {
      next(e);
    }
  };
}
