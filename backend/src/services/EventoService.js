import { eventoRepository } from "../repositories/EventoRepository.js";
import { categoriaRepository } from "../repositories/CategoriaRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { compraRepository } from "../repositories/CompraRepository.js";
import { reseniaRepository } from "../repositories/ReseniaRepository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { Evento } from "../domain/Evento.js";

export class EventoService {
  constructor(
    eventoRepo = eventoRepository,
    catRepo = categoriaRepository,
    userRepo = usuarioRepository,
    compRepo = compraRepository,
    resRepo = reseniaRepository
  ) {
    this.eventoRepository = eventoRepo;
    this.categoriaRepository = catRepo;
    this.usuarioRepository = userRepo;
    this.compraRepository = compRepo;
    this.reseniaRepository = resRepo;
  }

  create = async (nuevo, organizadorId) => {
    if (!organizadorId) {
      throw new BadRequestError("Se requiere un organizador para crear el evento");
    }

    const organizador = await this.usuarioRepository.findById(organizadorId);
    if (!organizador) {
      throw new NotFoundError("Organizador no encontrado");
    }
    if (organizador.rol !== "ORGANIZADOR") {
      throw new BadRequestError("El usuario debe tener rol de ORGANIZADOR");
    }

    let categoria = await this.categoriaRepository.findById(nuevo.categoria);
    if (!categoria) {
      categoria = await this.categoriaRepository.findByCodigo(nuevo.categoria);
    }
    if (!categoria) {
      throw new BadRequestError("Categoría no encontrada");
    }

    const fechaEvento = new Date(nuevo.fecha);
    if (isNaN(fechaEvento.getTime())) {
      throw new BadRequestError("Fecha de evento inválida");
    }
    if (fechaEvento <= new Date()) {
      throw new BadRequestError("La fecha del evento debe ser a futuro (Regla S11)");
    }

    const tiposEntradaArmados = (nuevo.tiposEntrada || []).map((tipo, idx) => ({
      id: tipo.id || `tipo_${idx + 1}`,
      _id: tipo.id || `tipo_${idx + 1}`,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || "",
      precio: tipo.precio,
      cupo: tipo.cupo,
      cupoDisponible: tipo.cupo,
    }));

    const eventoDominio = new Evento({
      nombre: nuevo.nombre,
      descripcion: nuevo.descripcion,
      categoria: categoria,
      fecha: fechaEvento.toISOString(),
      tiposEntrada: tiposEntradaArmados,
      multimedia: nuevo.multimedia || [],
      organizador: organizador,
    });

    return await this.eventoRepository.save(eventoDominio);
  };

  listarMios = async (organizadorId) => {
    if (!organizadorId) {
      throw new BadRequestError("Se requiere identificación del organizador");
    }
    return await this.eventoRepository.findByOrganizador(organizadorId);
  };

  buscar = async ({ q, categoria, orden, direccion }) => {
    const filter = {};

    if (q) {
      filter.q = q
        .replace(/[aá]/gi, "[aáÁ]")
        .replace(/[eé]/gi, "[eéÉ]")
        .replace(/[ií]/gi, "[iíÍ]")
        .replace(/[oó]/gi, "[oóÓ]")
        .replace(/[uú]/gi, "[uúÚ]");
    }

    if (categoria) {
      let cat = await this.categoriaRepository.findById(categoria);
      if (!cat) {
        cat = await this.categoriaRepository.findByCodigo(categoria);
      }
      if (cat) {
        filter.categoria = cat.id;
      }
    }

    const dir = direccion === "desc" ? -1 : 1;
    let eventos = await this.eventoRepository.getAll(filter, { fecha: 1 });

    // Enriquecer cada evento con precioMinimo, precioMaximo y puntajeOrganizador
    const todasResenas = await this.reseniaRepository.getAll();
    const todosEventos = await this.eventoRepository.getAll();

    eventos = eventos.map((ev) => {
      const precios = (ev.tiposEntrada || []).map((t) => t.precio);
      const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;
      const precioMaximo = precios.length > 0 ? Math.max(...precios) : 0;
      
      const orgId = ev.organizador?.id || ev.organizador?._id || ev.organizador;
      // Reseñas de todos los eventos de este organizador
      const eventosOrgIds = todosEventos
        .filter((e) => (e.organizador?.id || e.organizador?._id || e.organizador) === orgId)
        .map((e) => e.id);

      const resenasOrg = todasResenas.filter((r) =>
        eventosOrgIds.includes(r.evento?.id || r.evento?._id || r.evento)
      );

      let puntajeOrganizador = 0;
      if (resenasOrg.length > 0) {
        const sum = resenasOrg.reduce((acc, r) => acc + (r.puntuacion || 0), 0);
        puntajeOrganizador = Math.round((sum / resenasOrg.length) * 10) / 10;
      }

      return {
        ...ev,
        precioMinimo,
        precioMaximo,
        puntajeOrganizador,
      };
    });

    if (orden === "precio") {
      eventos.sort((a, b) => (a.precioMinimo - b.precioMinimo) * dir);
    } else if (orden === "fecha") {
      eventos.sort((a, b) => (new Date(a.fecha) - new Date(b.fecha)) * dir);
    } else if (orden === "puntaje") {
      eventos.sort((a, b) => (a.puntajeOrganizador - b.puntajeOrganizador) * dir);
    }

    return eventos;
  };

  getById = async (id) => {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new NotFoundError("Evento no encontrado");
    }

    const resenas = await this.reseniaRepository.findByEvento(id);
    const compras = await this.compraRepository.findByEvento(id);

    const tiposEntradaConDisponibilidad = (evento.tiposEntrada || []).map((t) => {
      const tId = t.id || t._id;
      const vendidas = compras
        .filter(
          (c) =>
            (c.tipoEntrada?.tipoEntradaId === tId || c.tipoEntrada?.id === tId) &&
            c.estado !== "CANCELADA" &&
            c.estado !== "REEMBOLSADA"
        )
        .reduce((sum, c) => sum + (c.cantidad || 0), 0);

      return {
        ...t,
        cupoRestante: Math.max(0, t.cupo - vendidas),
      };
    });

    return {
      ...evento,
      tiposEntrada: tiposEntradaConDisponibilidad,
      resenas: resenas || [],
    };
  };

  actualizar = async (id, datos, organizadorId) => {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new NotFoundError("Evento no encontrado");
    }

    const orgId = evento.organizador?.id || evento.organizador?._id || evento.organizador;
    if (organizadorId && orgId !== organizadorId) {
      throw new BadRequestError("No tiene permiso para editar este evento");
    }

    if (datos.fecha) {
      const nuevaFecha = new Date(datos.fecha);
      if (nuevaFecha <= new Date()) {
        throw new BadRequestError("La fecha del evento debe ser a futuro (Regla S11)");
      }
      datos.fecha = nuevaFecha.toISOString();
    }

    return await this.eventoRepository.save({ ...evento, ...datos, id });
  };

  eliminar = async (id, organizadorId) => {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new NotFoundError("Evento no encontrado");
    }

    const orgId = evento.organizador?.id || evento.organizador?._id || evento.organizador;
    if (organizadorId && orgId !== organizadorId) {
      throw new BadRequestError("No tiene permiso para eliminar este evento");
    }

    return await this.eventoRepository.delete(id);
  };

  listarCompras = async (eventoId) => {
    const evento = await this.getById(eventoId);
    const compras = await this.compraRepository.findByEvento(eventoId);

    const disponibilidadPorTipo = (evento.tiposEntrada || []).map((tipo) => {
      const tId = tipo.id || tipo._id;
      const vendidas = compras
        .filter(
          (c) =>
            (c.tipoEntrada?.tipoEntradaId === tId || c.tipoEntrada?.id === tId) &&
            c.estado !== "CANCELADA" &&
            c.estado !== "REEMBOLSADA"
        )
        .reduce((acc, c) => acc + (c.cantidad || 0), 0);

      return {
        tipoEntradaId: tId,
        nombre: tipo.nombre,
        precio: tipo.precio,
        cupoTotal: tipo.cupo,
        cupoRestante: Math.max(0, tipo.cupo - vendidas),
      };
    });

    return { compras, disponibilidadPorTipo };
  };

  listarResenas = async (eventoId) => {
    await this.getById(eventoId);
    return await this.reseniaRepository.findByEvento(eventoId);
  };
}

export const eventoService = new EventoService();
