import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { reputacionService } from "./ReputacionService.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export class OrganizadorService {
  constructor(
    usrRepo = usuarioRepository,
    repService = reputacionService
  ) {
    this.usuarioRepository = usrRepo;
    this.reputacionService = repService;
  }

  obtenerPerfil = async (id) => {
    if (!id || typeof id !== "string") {
      throw new NotFoundError("Organizador no encontrado");
    }

    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario || usuario.rol !== "ORGANIZADOR") {
      throw new NotFoundError("Organizador no encontrado");
    }

    const { puntajePromedio, cantidadResenas } =
      await this.reputacionService.calcularPuntajeOrganizador(id);

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      puntajePromedio,
      cantidadResenas,
    };
  };

  listarResenas = async (id) => {
    if (!id || typeof id !== "string") {
      throw new NotFoundError("Organizador no encontrado");
    }

    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario || usuario.rol !== "ORGANIZADOR") {
      throw new NotFoundError("Organizador no encontrado");
    }

    const { puntajePromedio, cantidadResenas } =
      await this.reputacionService.calcularPuntajeOrganizador(id);

    const resenasRaw = await this.reputacionService.obtenerResenasOrganizador(id);

    // Ordenar de la más nueva a la más vieja
    resenasRaw.sort((a, b) => new Date(b.resena.fecha) - new Date(a.resena.fecha));

    const resenas = resenasRaw.map((item) => ({
      id: item.resena.id,
      puntaje: item.resena.puntaje,
      comentario: item.resena.comentario,
      fecha: item.resena.fecha,
      evento: {
        id: item.evento?.id || item.compra?.evento?.id,
        nombre: item.evento?.nombre || item.compra?.evento?.nombre,
      },
      autor: {
        id: item.compra?.comprador?.id,
        nombre: item.compra?.comprador?.nombre,
      },
    }));

    return {
      puntajePromedio,
      cantidadResenas,
      resenas,
    };
  };
}

export const organizadorService = new OrganizadorService();
