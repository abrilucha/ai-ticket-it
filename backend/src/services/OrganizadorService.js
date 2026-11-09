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

    const resenas = resenasRaw.map((item) => {
      const comp = item.compra || {};
      const compComprador = comp.comprador || {};
      const compEvento = item.evento || comp.evento || {};
      const nombreCompleto = [compComprador.nombre, compComprador.apellido].filter(Boolean).join(" ") || compComprador.nombre || "Comprador";
      return {
        id: item.resena.id,
        puntaje: item.resena.puntaje,
        comentario: item.resena.comentario,
        fecha: item.resena.fecha,
        evento: {
          id: compEvento.id || compEvento,
          nombre: compEvento.nombre || "Evento",
        },
        autor: {
          id: compComprador.id,
          nombre: nombreCompleto,
          fotoPerfil: compComprador.fotoPerfil || null,
        },
      };
    });

    return {
      puntajePromedio,
      cantidadResenas,
      resenas,
    };
  };
}

export const organizadorService = new OrganizadorService();
