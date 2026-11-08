import { compraRepository } from "../repositories/CompraRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { mensajeRepository } from "../repositories/MensajeRepository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { MensajeSchema } from "../schemas/MensajeSchema.js";
import { Mensaje } from "../domain/Mensaje.js";

export class MensajeService {
  constructor(
    compRepo = compraRepository,
    usrRepo = usuarioRepository,
    msgRepo = mensajeRepository
  ) {
    this.compraRepository = compRepo;
    this.usuarioRepository = usrRepo;
    this.mensajeRepository = msgRepo;
  }

  // 1. Autenticación (401)
  validarAutenticacion(usuario) {
    if (!usuario || !usuario.id) {
      throw new UnauthorizedError(
        "Autenticación requerida: falta header x-user-id o el usuario no existe"
      );
    }
  }

  // 2. Existencia de compra (404) y 3. Participación (403)
  validarParticipacion(compra, usuarioId) {
    const compradorId = compra.comprador?.id;
    const orgEventoId = compra.evento?.organizador?.id || compra.evento?.organizador;

    const esComprador = Boolean(usuarioId && compradorId === usuarioId);
    const esOrganizadorEvento = Boolean(usuarioId && orgEventoId === usuarioId);

    if (!esComprador && !esOrganizadorEvento) {
      throw new ForbiddenError(
        "Acceso denegado: solo el comprador titular o el organizador del evento pueden participar en el chat de esta compra"
      );
    }

    return { esComprador, esOrganizadorEvento };
  }

  formatearMensaje(m, usuarioActualId, compra, usuariosMap = {}) {
    const compradorId = compra.comprador?.id;
    const esComprador = m.autorId === compradorId;
    const rolAutor = esComprador ? "COMPRADOR" : "ORGANIZADOR";

    let autor = usuariosMap[m.autorId];
    if (!autor) {
      if (esComprador && compra.comprador?.nombre) {
        autor = compra.comprador;
      } else if (!esComprador && compra.evento?.organizador?.nombre) {
        autor = compra.evento.organizador;
      }
    }

    return {
      id: m.id,
      compraId: m.compraId || compra.id,
      texto: m.texto,
      fecha: m.fecha,
      autor: {
        id: m.autorId,
        nombre: autor?.nombre || (esComprador ? "Comprador" : "Organizador"),
        rol: rolAutor,
      },
      esPropio: m.autorId === usuarioActualId,
    };
  }

  listarPorCompra = async (compraId, usuarioActual, { desde } = {}) => {
    // 1. Autenticación
    this.validarAutenticacion(usuarioActual);

    // 2. Existencia de la compra (404)
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    // 3. Participación (403)
    this.validarParticipacion(compra, usuarioActual.id);

    // 4. Validación de query param `desde` (400)
    let fechaFiltro = null;
    if (desde !== undefined && desde !== null && desde !== "") {
      const timestamp = Date.parse(desde);
      if (isNaN(timestamp) || typeof desde !== "string") {
        throw new BadRequestError("Parámetro 'desde' inválido: debe ser una fecha ISO 8601 válida");
      }
      fechaFiltro = new Date(timestamp);
    }

    // Obtener del repositorio propio de mensajes
    let mensajes = await this.mensajeRepository.findByCompraId(compraId);

    // Filtrar estrictamente posterior si se proveyó `desde`
    if (fechaFiltro) {
      mensajes = mensajes.filter((m) => new Date(m.fecha).getTime() > fechaFiltro.getTime());
    }

    // Orden cronológico ascendente (más viejo primero)
    mensajes.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    // Cargar autores
    const autoresIds = [...new Set(mensajes.map((m) => m.autorId))];
    const usuariosMap = {};
    for (const id of autoresIds) {
      const u = await this.usuarioRepository.findById(id);
      if (u) usuariosMap[id] = u;
    }

    return mensajes.map((m) =>
      this.formatearMensaje(m, usuarioActual.id, compra, usuariosMap)
    );
  };

  enviar = async (compraId, body, usuarioActual) => {
    // 1. Autenticación
    this.validarAutenticacion(usuarioActual);

    // 2. Existencia de la compra (404)
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    // 3. Participación (403)
    this.validarParticipacion(compra, usuarioActual.id);

    // 4. Validación del body (400)
    if (!body || typeof body !== "object") {
      throw new BadRequestError("El cuerpo de la solicitud es obligatorio");
    }

    const parsed = MensajeSchema.safeParse(body);
    if (!parsed.success) {
      const detalle = parsed.error.issues.map((i) => i.message).join(", ");
      throw new BadRequestError(`Datos inválidos: ${detalle}`);
    }

    const { texto } = parsed.data;

    // Crear mensaje con id único, fecha ISO 8601 generada por el servidor
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nuevoMensaje = new Mensaje({
      id,
      compraId: compra.id,
      autorId: usuarioActual.id,
      texto,
      fecha: new Date().toISOString(),
    });

    // Guardar en el MensajeRepository propio
    await this.mensajeRepository.save(nuevoMensaje);

    const usuariosMap = { [usuarioActual.id]: usuarioActual };
    return this.formatearMensaje(nuevoMensaje, usuarioActual.id, compra, usuariosMap);
  };
}
