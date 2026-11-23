import { resenaRepository } from "../repositories/ResenaRepository.js";
import { compraRepository } from "../repositories/CompraRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { ResenaSchema } from "../schemas/ResenaSchema.js";
import { Resena } from "../domain/Resena.js";
import { EstadoCompra } from "../domain/EstadoCompra.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

export class ResenaService {
  constructor(
    resRepo = resenaRepository,
    compRepo = compraRepository,
    usrRepo = usuarioRepository
  ) {
    this.resenaRepository = resRepo;
    this.compraRepository = compRepo;
    this.usuarioRepository = usrRepo;
  }

  formatearResena(resena, compra) {
    const compComprador = compra?.comprador || {};
    const nombreCompleto =
      [compComprador.nombre, compComprador.apellido].filter(Boolean).join(" ") ||
      compComprador.nombre ||
      "Comprador";
    return {
      id: resena.id,
      compraId: resena.compraId,
      puntaje: resena.puntaje,
      comentario: resena.comentario,
      fecha: resena.fecha,
      evento: {
        id: compra.evento?.id || compra.evento,
        nombre: compra.evento?.nombre || "Evento",
      },
      autor: {
        id: compComprador.id,
        nombre: nombreCompleto,
        fotoPerfil: compComprador.fotoPerfil || null,
      },
    };
  }

  crear = async (compraId, body, usuarioActual) => {
    // 1. Autenticación (401)
    if (!usuarioActual || !usuarioActual.id) {
      throw new UnauthorizedError(
        "Autenticación requerida: falta header x-user-id o el usuario no existe"
      );
    }

    // 2. Existencia de la compra (404)
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    // 3. Participación: solo el COMPRADOR titular (403)
    const compradorId = compra.comprador?.id;
    if (compradorId !== usuarioActual.id) {
      throw new ForbiddenError(
        "Acceso denegado: solo el comprador titular de la entrada puede dejar una reseña"
      );
    }

    // 4. Estado de la compra (409)
    if (compra.estado !== EstadoCompra.UTILIZADA) {
      throw new ConflictError(
        "Solo se pueden calificar compras cuya entrada haya sido utilizada",
        "COMPRA_NO_UTILIZADA"
      );
    }

    // 4b. Una sola reseña por compra (409)
    const resenaPrevia = await this.resenaRepository.findByCompra(compraId);
    if (resenaPrevia) {
      throw new ConflictError(
        "Esta compra ya cuenta con una reseña registrada",
        "RESENA_YA_EXISTE"
      );
    }

    // 5. Validación del body (400)
    if (!body || typeof body !== "object") {
      throw new BadRequestError("El cuerpo de la solicitud es obligatorio");
    }

    const parsed = ResenaSchema.safeParse(body);
    if (!parsed.success) {
      const detalles = parsed.error.issues.map((i) => i.message).join(", ");
      throw new BadRequestError(`Datos inválidos: ${detalles}`);
    }

    const { puntaje, comentario } = parsed.data;

    const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nuevaResena = new Resena({
      id,
      compraId: compra.id,
      puntaje,
      comentario,
      fecha: new Date().toISOString(),
    });

    const guardada = await this.resenaRepository.save(nuevaResena);

    return this.formatearResena(guardada, compra);
  };

  obtenerPorCompra = async (compraId, usuarioActual) => {
    // 1. Autenticación (401)
    if (!usuarioActual || !usuarioActual.id) {
      throw new UnauthorizedError(
        "Autenticación requerida: falta header x-user-id o el usuario no existe"
      );
    }

    // 2. Existencia de la compra (404)
    const compra = await this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError("Compra no encontrada");
    }

    // 3. Participación: Comprador titular u organizador del evento (403)
    const compradorId = compra.comprador?.id;
    const orgEventoId = compra.evento?.organizador?.id || compra.evento?.organizador;

    const esComprador = Boolean(usuarioActual.id && compradorId === usuarioActual.id);
    const esOrganizadorEvento = Boolean(usuarioActual.id && orgEventoId === usuarioActual.id);

    if (!esComprador && !esOrganizadorEvento) {
      throw new ForbiddenError(
        "Acceso denegado: solo los participantes de la compra pueden consultar su reseña"
      );
    }

    // 4. Buscar reseña
    const resena = await this.resenaRepository.findByCompra(compraId);
    if (!resena) {
      throw new NotFoundError("No se encontró reseña para esta compra", "RESENA_NO_ENCONTRADA");
    }

    return this.formatearResena(resena, compra);
  };
}

export const resenaService = new ResenaService();
