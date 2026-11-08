import { EventoService } from "../services/EventoService.js";

export class EventoController {
  constructor(eventoService = new EventoService()) {
    this.eventoService = eventoService;
  }

  buscar = async (req, res, next) => {
    try {
      const { q, categoria, orden, direccion } = req.query;
      const eventos = await this.eventoService.buscar({ q, categoria, orden, direccion });
      res.status(200).json(eventos);
    } catch (e) {
      next(e);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const evento = await this.eventoService.obtenerPorId(req.params.id);
      res.status(200).json(evento);
    } catch (e) {
      next(e);
    }
  };

  crear = async (req, res, next) => {
    try {
      const organizadorId = req.user?.id || req.headers["x-user-id"];
      const nuevoEvento = await this.eventoService.crear(req.body, organizadorId);
      res.status(201).json(nuevoEvento);
    } catch (e) {
      next(e);
    }
  };

  actualizar = async (req, res, next) => {
    try {
      const eventoActualizado = await this.eventoService.actualizar(req.params.id, req.body);
      res.status(200).json(eventoActualizado);
    } catch (e) {
      next(e);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      await this.eventoService.eliminar(req.params.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };

  listarMios = async (req, res, next) => {
    try {
      const organizadorId = req.user?.id || req.headers["x-user-id"];
      const misEventos = await this.eventoService.listarMios(organizadorId);
      res.status(200).json(misEventos);
    } catch (e) {
      next(e);
    }
  };

  listarCompras = async (req, res, next) => {
    try {
      const comprasInfo = await this.eventoService.listarCompras(req.params.id);
      res.status(200).json(comprasInfo);
    } catch (e) {
      next(e);
    }
  };

  listarResenas = async (req, res, next) => {
    try {
      const resenas = await this.eventoService.listarResenas(req.params.id);
      res.status(200).json(resenas);
    } catch (e) {
      next(e);
    }
  };
}
