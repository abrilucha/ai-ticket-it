import { compraRepository } from "../repositories/CompraRepository.js";
import { eventoRepository } from "../repositories/EventoRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { cambioEstadoCompraRepository } from "../repositories/CambioEstadoCompraRepository.js";
import { EstadoCompra } from "../domain/EstadoCompra.js";
import { Compra } from "../domain/Compra.js";
import { MaquinaEstadoCompra } from "../domain/MaquinaEstadoCompra.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

export class CompraService {
  constructor(
    compRepo = compraRepository,
    evRepo = eventoRepository,
    usrRepo = usuarioRepository,
    histRepo = cambioEstadoCompraRepository
  ) {
    this.compraRepository = compRepo;
    this.eventoRepository = evRepo;
    this.usuarioRepository = usrRepo;
    this.cambioEstadoCompraRepository = histRepo;
  }

  calcularDiasRestantes(fechaEvento) {
    if (!fechaEvento) return null;
    const diffTime = new Date(fechaEvento).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  enriquecerCompra(compra, usuarioId, usuarioRol) {
    const fechaEvento = compra.evento?.fecha;
    const eventoPasado = fechaEvento ? new Date(fechaEvento) <= new Date() : false;
    
    const compradorId = compra.comprador?.id || compra.comprador?._id;
    const orgEventoId = compra.evento?.organizador?.id || compra.evento?.organizador?._id || compra.evento?.organizador;

    const esComprador = !usuarioId || compradorId === usuarioId;
    const esOrganizadorEvento = usuarioId ? orgEventoId === usuarioId : false;

    const puedePagar = compra.estado === EstadoCompra.PENDIENTE && esComprador;
    const puedeCancelar =
      (compra.estado === EstadoCompra.PENDIENTE || compra.estado === EstadoCompra.CONFIRMADA) &&
      !eventoPasado &&
      esComprador;
    const puedeUtilizar = compra.estado === EstadoCompra.CONFIRMADA && esOrganizadorEvento;
    const puedeResenar = compra.estado === EstadoCompra.UTILIZADA && esComprador;

    const diasRestantes =
      compra.estado === EstadoCompra.CONFIRMADA
        ? this.calcularDiasRestantes(fechaEvento)
        : null;

    return {
      ...compra,
      diasRestantes,
      puedePagar,
      puedeCancelar,
      puedeUtilizar,
      puedeResenar,
      fechaCancelacion: compra.fechaCancelacion || null,
      montoReembolsado: compra.montoReembolsado ?? (compra.estado === EstadoCompra.REEMBOLSADA ? compra.total : 0),
    };
  }

  crear = async ({ eventoId, tipoEntradaId, cantidad }, compradorId) => {
    if (!compradorId) {
      throw new BadRequestError("Se requiere la identificación del comprador");
    }

    const comprador = await this.usuarioRepository.findById(compradorId);
    if (!comprador) {
      throw new NotFoundError("Comprador no encontrado");
    }
    if (comprador.rol !== "COMPRADOR") {
      throw new ForbiddenError("Solo un usuario con rol COMPRADOR puede realizar compras");
    }

    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) {
      throw new NotFoundError("Evento no encontrado");
    }

    if (new Date(evento.fecha) <= new Date()) {
      throw new ConflictError("No se pueden comprar entradas para un evento que ya se realizó (Regla S11)");
    }

    const tipoEntrada = (evento.tiposEntrada || []).find(
      (t) => t.id === tipoEntradaId || t._id === tipoEntradaId
    );
    if (!tipoEntrada) {
      throw new NotFoundError("Tipo de entrada no encontrado en este evento");
    }

    // Regla S3: Verificar cupo disponible considerando compras previas (PENDIENTE, CONFIRMADA y UTILIZADA consumen cupo)
    const comprasEvento = await this.compraRepository.findByEvento(eventoId);
    const entradasVendidas = comprasEvento
      .filter(
        (c) =>
          (c.tipoEntrada?.tipoEntradaId === tipoEntradaId || c.tipoEntrada?.id === tipoEntradaId) &&
          c.estado !== EstadoCompra.CANCELADA &&
          c.estado !== EstadoCompra.REEMBOLSADA
      )
      .reduce((sum, c) => sum + (c.cantidad || 0), 0);

    const cupoRestante = Math.max(0, tipoEntrada.cupo - entradasVendidas);
    if (cantidad > cupoRestante) {
      throw new ConflictError(
        `Cupo insuficiente (Regla S3): solo quedan ${cupoRestante} entradas de tipo '${tipoEntrada.nombre}'`
      );
    }

    // Regla S4: Cálculo del total
    const total = tipoEntrada.precio * cantidad;

    // Regla S5: Máquina de estados (nace en PENDIENTE)
    const compraDominio = new Compra({
      comprador: {
        id: comprador.id,
        _id: comprador.id,
        nombre: comprador.nombre,
        apellido: comprador.apellido,
        email: comprador.email,
      },
      evento: {
        id: evento.id,
        _id: evento.id,
        nombre: evento.nombre,
        fecha: evento.fecha,
        organizador: evento.organizador,
      },
      tipoEntrada: {
        tipoEntradaId: tipoEntrada.id,
        id: tipoEntrada.id,
        _id: tipoEntrada.id,
        nombre: tipoEntrada.nombre,
        precio: tipoEntrada.precio,
      },
      cantidad,
      total,
      estado: EstadoCompra.PENDIENTE,
      mensajes: [],
    });

    const compraGuardada = await this.compraRepository.save(compraDominio);

    await this.cambioEstadoCompraRepository.save({
      compra: compraGuardada,
      estado: EstadoCompra.PENDIENTE,
      quien: comprador,
      fechaHora: new Date(),
    });

    return this.enriquecerCompra(compraGuardada, compradorId, "COMPRADOR");
  };

  pagar = async (compraId, usuarioId) => {
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    if (usuarioId) {
      const compradorId = compra.comprador?.id || compra.comprador?._id;
      if (compradorId !== usuarioId) {
        throw new ForbiddenError("Acceso denegado: solo el comprador titular puede pagar esta compra");
      }
    }

    // Transición centralizada mediante MaquinaEstadoCompra
    const nuevoEstado = MaquinaEstadoCompra.transicionar(compra, "PAGAR");
    compra.estado = nuevoEstado;

    const compraActualizada = await this.compraRepository.save(compra);

    const quien = usuarioId ? await this.usuarioRepository.findById(usuarioId) : compra.comprador;
    await this.cambioEstadoCompraRepository.save({
      compra: compraActualizada,
      estado: nuevoEstado,
      quien: quien || compra.comprador,
      fechaHora: new Date(),
    });

    return this.enriquecerCompra(compraActualizada, usuarioId, "COMPRADOR");
  };

  utilizar = async (compraId, usuarioId) => {
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    // Validación de propiedad y rol de Organizador
    if (usuarioId) {
      const usuario = await this.usuarioRepository.findById(usuarioId);
      if (!usuario || usuario.rol !== "ORGANIZADOR") {
        throw new ForbiddenError("Solo un usuario con rol ORGANIZADOR puede marcar entradas como utilizadas");
      }
      const orgEventoId = compra.evento?.organizador?.id || compra.evento?.organizador?._id || compra.evento?.organizador;
      if (orgEventoId !== usuarioId) {
        throw new ForbiddenError("Acceso denegado: solo el organizador dueño del evento puede validar y utilizar esta entrada");
      }
    }

    // Transición centralizada mediante MaquinaEstadoCompra
    const nuevoEstado = MaquinaEstadoCompra.transicionar(compra, "UTILIZAR");
    compra.estado = nuevoEstado;

    const compraActualizada = await this.compraRepository.save(compra);

    const quien = usuarioId ? await this.usuarioRepository.findById(usuarioId) : compra.comprador;
    await this.cambioEstadoCompraRepository.save({
      compra: compraActualizada,
      estado: nuevoEstado,
      quien: quien || compra.comprador,
      fechaHora: new Date(),
    });

    return this.enriquecerCompra(compraActualizada, usuarioId, "ORGANIZADOR");
  };

  cancelar = async (compraId, usuarioId) => {
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    // Validación de permisos: Solo el comprador titular puede cancelar (caso de uso C10)
    if (usuarioId) {
      const usuario = await this.usuarioRepository.findById(usuarioId);
      if (usuario && usuario.rol === "ORGANIZADOR") {
        throw new ForbiddenError("Los organizadores no pueden cancelar compras de los usuarios");
      }
      const compradorId = compra.comprador?.id || compra.comprador?._id;
      if (compradorId !== usuarioId) {
        throw new ForbiddenError("Acceso denegado: solo el comprador titular puede cancelar su propia compra");
      }
    }

    // Regla S8: Orden determinístico de validación
    // 1. Bloqueo si ya está utilizada
    if (compra.estado === EstadoCompra.UTILIZADA) {
      throw new ConflictError("No se puede cancelar una compra cuya entrada ya fue utilizada (Regla S8)");
    }

    // 2. Bloqueo si ya está cancelada o reembolsada
    if (compra.estado === EstadoCompra.CANCELADA || compra.estado === EstadoCompra.REEMBOLSADA) {
      throw new ConflictError(`La compra ya se encuentra ${compra.estado.toLowerCase()}`);
    }

    // 3. Bloqueo si el evento ya se realizó
    if (compra.evento?.fecha && new Date(compra.evento.fecha) <= new Date()) {
      throw new ConflictError("No se puede cancelar una compra de un evento que ya se realizó (Regla S8)");
    }

    // Transición centralizada mediante MaquinaEstadoCompra
    const nuevoEstado = MaquinaEstadoCompra.transicionar(compra, "CANCELAR");
    compra.estado = nuevoEstado;
    compra.fechaCancelacion = new Date().toISOString();
    compra.montoReembolsado = nuevoEstado === EstadoCompra.REEMBOLSADA ? compra.total : 0;

    const compraActualizada = await this.compraRepository.save(compra);

    const quien = usuarioId ? await this.usuarioRepository.findById(usuarioId) : compra.comprador;
    await this.cambioEstadoCompraRepository.save({
      compra: compraActualizada,
      estado: nuevoEstado,
      quien: quien || compra.comprador,
      fechaHora: new Date(),
    });

    return this.enriquecerCompra(compraActualizada, usuarioId, "COMPRADOR");
  };

  listarMias = async (compradorId) => {
    if (!compradorId) {
      throw new BadRequestError("Se requiere la identificación del comprador");
    }

    const compras = await this.compraRepository.findByComprador(compradorId);

    return compras.map((compra) => this.enriquecerCompra(compra, compradorId, "COMPRADOR"));
  };

  obtenerPorId = async (compraId, usuarioId) => {
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    const historial = await this.cambioEstadoCompraRepository.findByCompra(compraId);

    const enriquecida = this.enriquecerCompra(compra, usuarioId);
    return {
      ...enriquecida,
      historial,
    };
  };
}

export const compraService = new CompraService();
