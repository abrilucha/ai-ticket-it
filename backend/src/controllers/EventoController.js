import { EventoService, eventoService as defaultEventoService } from "../services/EventoService.js";

export class EventoController {
  constructor(eventoService = defaultEventoService || new EventoService()) {
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

  getById = async (req, res, next) => {
    try {
      const evento = await this.eventoService.getById(req.params.id);
      res.status(200).json(evento);
    } catch (e) {
      next(e);
    }
  };

  create = async (req, res, next) => {
    try {
      const organizadorId = req.user?._id || req.user?.id || req.headers["x-user-id"];
      const nuevoEvento = await this.eventoService.create(req.body, organizadorId);
      res.status(201).json(nuevoEvento);
    } catch (e) {
      next(e);
    }
  };

  listarMios = async (req, res, next) => {
    try {
      const organizadorId = req.user?._id || req.user?.id || req.headers["x-user-id"];
      const misEventos = await this.eventoService.listarMios(organizadorId);
      res.status(200).json(misEventos);
    } catch (e) {
      next(e);
    }
  };

  update = async (req, res, next) => {
    try {
      const organizadorId = req.user?._id || req.user?.id || req.headers["x-user-id"];
      const eventoActualizado = await this.eventoService.actualizar(req.params.id, req.body, organizadorId);
      res.status(200).json(eventoActualizado);
    } catch (e) {
      next(e);
    }
  };

  delete = async (req, res, next) => {
    try {
      const organizadorId = req.user?._id || req.user?.id || req.headers["x-user-id"];
      await this.eventoService.eliminar(req.params.id, organizadorId);
      res.status(204).send();
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
