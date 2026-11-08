import { compraRepository } from "../repositories/CompraRepository.js";
import { eventoRepository } from "../repositories/EventoRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { cambioEstadoCompraRepository } from "../repositories/CambioEstadoCompraRepository.js";
import { reseniaRepository } from "../repositories/ReseniaRepository.js";
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
    histRepo = cambioEstadoCompraRepository,
    resRepo = reseniaRepository
  ) {
    this.compraRepository = compRepo;
    this.eventoRepository = evRepo;
    this.usuarioRepository = usrRepo;
    this.cambioEstadoCompraRepository = histRepo;
    this.reseniaRepository = resRepo;
  }

  calcularDiasRestantes(fechaEvento) {
    if (!fechaEvento) return null;
    const diffTime = new Date(fechaEvento).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  async enriquecerCompra(compra, usuarioId, usuarioRol) {
    const fechaEvento = compra.evento?.fecha;
    const eventoPasado = fechaEvento ? new Date(fechaEvento) <= new Date() : false;

    const compradorId = compra.comprador?.id || compra.comprador?._id;
    const orgEventoId =
      compra.evento?.organizador?.id ||
      compra.evento?.organizador?._id ||
      compra.evento?.organizador;

    const esComprador = Boolean(usuarioId && compradorId === usuarioId);
    const esOrganizadorEvento = Boolean(usuarioId && orgEventoId === usuarioId);

    const resenia = await this.reseniaRepository.findByCompra(compra.id || compra._id);
    const resenada = Boolean(resenia);

    const puedePagar = compra.estado === EstadoCompra.PENDIENTE && esComprador;
    const puedeCancelar =
      (compra.estado === EstadoCompra.PENDIENTE || compra.estado === EstadoCompra.CONFIRMADA) &&
      !eventoPasado &&
      esComprador;
    const puedeUtilizar = compra.estado === EstadoCompra.CONFIRMADA && esOrganizadorEvento;
    const puedeResenar = compra.estado === EstadoCompra.UTILIZADA && !resenada && esComprador;

    const diasRestantes =
      compra.estado === EstadoCompra.CONFIRMADA
        ? this.calcularDiasRestantes(fechaEvento)
        : null;

    // A2: Garantizar que los mensajes NO se devuelven en la compra
    const { mensajes: _omitted, ...compraSinMensajes } = compra;

    return {
      ...compraSinMensajes,
      diasRestantes,
      puedePagar,
      puedeCancelar,
      puedeUtilizar,
      puedeResenar,
      resenada,
      fechaCancelacion: compra.fechaCancelacion || null,
      montoReembolsado:
        compra.montoReembolsado ??
        (compra.estado === EstadoCompra.REEMBOLSADA ? compra.total : 0),
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
        tipoEntradaId: tipoEntrada.id || tipoEntrada._id,
        nombre: tipoEntrada.nombre,
        precio: tipoEntrada.precio,
      },
      cantidad,
      total,
      estado: EstadoCompra.PENDIENTE,
    });

    const compraGuardada = await this.compraRepository.save(compraDominio);

    // Registro en historial
    await this.cambioEstadoCompraRepository.save({
      compraId: compraGuardada.id,
      estadoAnterior: null,
      estadoNuevo: EstadoCompra.PENDIENTE,
      fecha: new Date().toISOString(),
      motivo: "Creación de compra inicial",
    });

    return await this.enriquecerCompra(compraGuardada, compradorId, "COMPRADOR");
  };

  pagar = async (compraId, usuarioId) => {
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    const compradorId = compra.comprador?.id || compra.comprador?._id;
    if (usuarioId && compradorId !== usuarioId) {
      throw new ForbiddenError("Acceso denegado: solo el comprador titular puede pagar esta compra");
    }

    const estadoAnterior = compra.estado;

    // Delegación estricta a la máquina de estados centralizada
    const nuevoEstado = MaquinaEstadoCompra.transicionar(compra, "PAGAR");
    compra.estado = nuevoEstado;

    const compraActualizada = await this.compraRepository.save(compra);

    await this.cambioEstadoCompraRepository.save({
      compraId: compraActualizada.id,
      estadoAnterior,
      estadoNuevo: EstadoCompra.CONFIRMADA,
      fecha: new Date().toISOString(),
      motivo: "Pago confirmado exitosamente",
    });

    return await this.enriquecerCompra(compraActualizada, usuarioId, "COMPRADOR");
  };

  utilizar = async (compraId, usuarioId) => {
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    const orgEventoId =
      compra.evento?.organizador?.id ||
      compra.evento?.organizador?._id ||
      compra.evento?.organizador;

    if (usuarioId && orgEventoId !== usuarioId) {
      throw new ForbiddenError(
        "Acceso denegado: solo el organizador dueño del evento puede validar y utilizar esta entrada"
      );
    }

    const estadoAnterior = compra.estado;
    const nuevoEstado = MaquinaEstadoCompra.transicionar(compra, "UTILIZAR");
    compra.estado = nuevoEstado;

    const compraActualizada = await this.compraRepository.save(compra);

    await this.cambioEstadoCompraRepository.save({
      compraId: compraActualizada.id,
      estadoAnterior,
      estadoNuevo: EstadoCompra.UTILIZADA,
      fecha: new Date().toISOString(),
      motivo: "Entrada utilizada en el evento",
    });

    return await this.enriquecerCompra(compraActualizada, usuarioId, "ORGANIZADOR");
  };

  cancelar = async (compraId, usuarioId) => {
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    const compradorId = compra.comprador?.id || compra.comprador?._id;
    const orgEventoId =
      compra.evento?.organizador?.id ||
      compra.evento?.organizador?._id ||
      compra.evento?.organizador;

    if (usuarioId && usuarioId === orgEventoId) {
      throw new ForbiddenError("Los organizadores no pueden cancelar compras de sus clientes (Regla Caso de Uso 8)");
    }

    if (usuarioId && compradorId !== usuarioId) {
      throw new ForbiddenError("Acceso denegado: solo el comprador titular puede solicitar la cancelación de su compra");
    }

    // Regla S8: Bloqueo si la entrada ya fue utilizada
    if (compra.estado === EstadoCompra.UTILIZADA) {
      throw new ConflictError("No se puede cancelar una compra cuya entrada ya fue utilizada (Regla S8)");
    }

    // Regla S8 / S11: Bloqueo si el evento ya se realizó
    const fechaEvento = compra.evento?.fecha;
    if (fechaEvento && new Date(fechaEvento) <= new Date()) {
      throw new ConflictError("No se puede cancelar una compra de un evento que ya se realizó (Regla S8)");
    }

    const estadoAnterior = compra.estado;
    const estadoDestino =
      estadoAnterior === EstadoCompra.CONFIRMADA
        ? EstadoCompra.REEMBOLSADA
        : EstadoCompra.CANCELADA;

    const nuevoEstado = MaquinaEstadoCompra.transicionar(compra, "CANCELAR");
    compra.estado = nuevoEstado;
    compra.fechaCancelacion = new Date().toISOString();
    compra.montoReembolsado = estadoDestino === EstadoCompra.REEMBOLSADA ? compra.total : 0;

    const compraActualizada = await this.compraRepository.save(compra);

    await this.cambioEstadoCompraRepository.save({
      compraId: compraActualizada.id,
      estadoAnterior,
      estadoNuevo: estadoDestino,
      fecha: compra.fechaCancelacion,
      motivo:
        estadoDestino === EstadoCompra.REEMBOLSADA
          ? "Cancelación con reembolso de compra confirmada"
          : "Cancelación de reserva pendiente",
    });

    return await this.enriquecerCompra(compraActualizada, usuarioId, "COMPRADOR");
  };

  listarMias = async (compradorId) => {
    if (!compradorId) {
      throw new BadRequestError("Se requiere identificación del comprador");
    }
    const compras = await this.compraRepository.findByComprador(compradorId);
    return await Promise.all(
      compras.map((compra) => this.enriquecerCompra(compra, compradorId, "COMPRADOR"))
    );
  };

  obtenerPorId = async (compraId, usuarioId) => {
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    const enriquecida = await this.enriquecerCompra(compra, usuarioId);
    const historial = await this.cambioEstadoCompraRepository.findByCompra(compraId);

    return {
      ...enriquecida,
      historialEstados: historial,
    };
  };
}

export const compraService = new CompraService();
