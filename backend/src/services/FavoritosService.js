import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { eventoRepository } from "../repositories/EventoRepository.js";
import { eventoService as defaultEventoService } from "./EventoService.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

export class FavoritosService {
  constructor(
    userRepo = usuarioRepository,
    eventoRepo = eventoRepository,
    evService = defaultEventoService
  ) {
    this.usuarioRepository = userRepo;
    this.eventoRepository = eventoRepo;
    this.eventoService = evService;
  }

  /**
   * Valida existencia y rol del usuario.
   * Regla de dominio: Solo los COMPRADORES pueden gestionar favoritos.
   * Vive en el servicio, respondiendo 403 FAVORITOS_SOLO_COMPRADORES para ORGANIZADORES.
   */
  async _validarComprador(usuarioId) {
    if (!usuarioId) {
      throw new NotFoundError("Usuario no encontrado", "NO_ENCONTRADO");
    }
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundError("Usuario no encontrado", "NO_ENCONTRADO");
    }
    if (usuario.rol !== "COMPRADOR") {
      throw new ForbiddenError(
        "Solo los compradores pueden guardar eventos favoritos",
        "FAVORITOS_SOLO_COMPRADORES"
      );
    }
    return usuario;
  }

  /**
   * GET /favoritos
   * Lista los eventos favoritos del usuario del más reciente al más antiguo.
   * Mismo formato que GET /eventos, incluyendo precioMinimo, realizado, puntajeOrganizador,
   * cantidadResenas y esFavorito: true. Incluye eventos realizados.
   */
  listar = async (usuarioId) => {
    const usuario = await this._validarComprador(usuarioId);
    const recientes = usuario.obtenerFavoritosRecientes();

    const eventosEnriquecidos = [];
    for (const item of recientes) {
      const eventoId = item?.id || item;
      const ev = await this.eventoRepository.findById(eventoId);
      if (ev) {
        const enriquecido = await this.eventoService.enriquecerEvento(ev, usuario);
        eventosEnriquecidos.push({
          ...enriquecido,
          esFavorito: true,
        });
      }
    }

    return eventosEnriquecidos;
  };

  /**
   * POST /favoritos/:eventoId
   * 201 Created si se agregó; 200 OK si ya era favorito (idempotente).
   * 404 si el evento no existe.
   */
  agregar = async (usuarioId, eventoId) => {
    const usuario = await this._validarComprador(usuarioId);

    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) {
      throw new NotFoundError("El evento especificado no existe", "NO_ENCONTRADO");
    }

    const yaEraFavorito = usuario.esFavorito(eventoId);
    if (yaEraFavorito) {
      return {
        statusCode: 200,
        data: { eventoId, esFavorito: true },
      };
    }

    usuario.agregarFavorito(evento);
    await this.usuarioRepository.save(usuario);

    return {
      statusCode: 201,
      data: { eventoId, esFavorito: true },
    };
  };

  /**
   * DELETE /favoritos/:eventoId
   * 204 No Content si se eliminó o si ya no era favorito (idempotente).
   * 404 si el evento no existe.
   */
  quitar = async (usuarioId, eventoId) => {
    const usuario = await this._validarComprador(usuarioId);

    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) {
      throw new NotFoundError("El evento especificado no existe", "NO_ENCONTRADO");
    }

    usuario.quitarFavorito(eventoId);
    await this.usuarioRepository.save(usuario);

    return { statusCode: 204 };
  };
}

export const favoritosService = new FavoritosService();
