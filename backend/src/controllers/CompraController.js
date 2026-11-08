import { CompraService, compraService as defaultCompraService } from "../services/CompraService.js";

export class CompraController {
  constructor(compraService = defaultCompraService || new CompraService()) {
    this.compraService = compraService;
  }

  crear = async (req, res, next) => {
    try {
      const compradorId = req.user?.id || req.user?._id || req.headers["x-user-id"];
      const compra = await this.compraService.crear(req.body, compradorId);
      res.status(201).json(compra);
    } catch (e) {
      next(e);
    }
  };

  listarMias = async (req, res, next) => {
    try {
      const compradorId = req.user?.id || req.user?._id || req.headers["x-user-id"];
      const compras = await this.compraService.listarMias(compradorId);
      res.status(200).json(compras);
    } catch (e) {
      next(e);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.user?._id || req.headers["x-user-id"];
      const compra = await this.compraService.obtenerPorId(req.params.id, usuarioId);
      res.status(200).json(compra);
    } catch (e) {
      next(e);
    }
  };

  pagar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.user?._id || req.headers["x-user-id"];
      const resultado = await this.compraService.pagar(req.params.id, usuarioId);
      res.status(200).json(resultado);
    } catch (e) {
      next(e);
    }
  };

  utilizar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.user?._id || req.headers["x-user-id"];
      const resultado = await this.compraService.utilizar(req.params.id, usuarioId);
      res.status(200).json(resultado);
    } catch (e) {
      next(e);
    }
  };

  cancelar = async (req, res, next) => {
    try {
      const usuarioId = req.user?.id || req.user?._id || req.headers["x-user-id"];
      const resultado = await this.compraService.cancelar(req.params.id, usuarioId);
      res.status(200).json(resultado);
    } catch (e) {
      next(e);
    }
  };
}
