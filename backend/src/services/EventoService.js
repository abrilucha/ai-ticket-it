import { eventoRepository } from "../repositories/EventoRepository.js";
import { categoriaRepository } from "../repositories/CategoriaRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { Evento } from "../domain/Evento.js";
import { CompraModel } from "../mongoschemas/CompraModel.js";
import { ReseniaModel } from "../mongoschemas/ReseniaModel.js";

export class EventoService {
  constructor(
    eventoRepo = eventoRepository,
    catRepo = categoriaRepository,
    userRepo = usuarioRepository
  ) {
    this.eventoRepository = eventoRepo;
    this.categoriaRepository = catRepo;
    this.usuarioRepository = userRepo;
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

    const tiposEntradaArmados = (nuevo.tiposEntrada || []).map((tipo) => ({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || "",
      precio: tipo.precio,
      cupo: tipo.cupo,
      cupoDisponible: tipo.cupo,
    }));

    const eventoDominio = new Evento({
      nombre: nuevo.nombre,
      descripcion: nuevo.descripcion,
      categoria: categoria._id,
      fecha: fechaEvento,
      tiposEntrada: tiposEntradaArmados,
      multimedia: nuevo.multimedia || [],
      organizador: organizador._id,
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
      filter.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { descripcion: { $regex: q, $options: "i" } },
      ];
    }

    if (categoria) {
      let cat = await this.categoriaRepository.findById(categoria);
      if (!cat) {
        cat = await this.categoriaRepository.findByCodigo(categoria);
      }
      if (cat) {
        filter.categoria = cat._id;
      }
    }

    const dir = direccion === "desc" ? -1 : 1;
    let sort = { fecha: 1 };

    if (orden === "precio") {
      sort = { "tiposEntrada.precio": dir };
    } else if (orden === "fecha") {
      sort = { fecha: dir };
    }

    return await this.eventoRepository.getAll(filter, sort);
  };

  getById = async (id) => {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new NotFoundError("Evento no encontrado");
    }
    return evento;
  };

  actualizar = async (id, datos, organizadorId) => {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new NotFoundError("Evento no encontrado");
    }

    if (organizadorId && evento.organizador?._id?.toString() !== organizadorId.toString()) {
      throw new BadRequestError("No tiene permiso para editar este evento");
    }

    if (datos.fecha) {
      const nuevaFecha = new Date(datos.fecha);
      if (nuevaFecha <= new Date()) {
        throw new BadRequestError("La fecha del evento debe ser a futuro (Regla S11)");
      }
      datos.fecha = nuevaFecha;
    }

    return await this.eventoRepository.save({ id, ...datos });
  };

  eliminar = async (id, organizadorId) => {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new NotFoundError("Evento no encontrado");
    }

    if (organizadorId && evento.organizador?._id?.toString() !== organizadorId.toString()) {
      throw new BadRequestError("No tiene permiso para eliminar este evento");
    }

    return await this.eventoRepository.delete(id);
  };

  listarCompras = async (eventoId) => {
    const evento = await this.getById(eventoId);
    const compras = await CompraModel.find({ evento: eventoId })
      .populate("comprador", "nombre apellido email")
      .lean();

    const disponibilidadPorTipo = (evento.tiposEntrada || []).map((tipo) => {
      const vendidas = compras
        .filter((c) => c.tipoEntrada?.tipoEntradaId?.toString() === tipo._id?.toString() && c.estado !== "CANCELADA")
        .reduce((acc, c) => acc + (c.cantidad || 0), 0);
      return {
        tipoEntradaId: tipo._id,
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
    return await ReseniaModel.find({ evento: eventoId })
      .populate("comprador", "nombre apellido")
      .sort({ fecha: -1 })
      .lean();
  };
}

export const eventoService = new EventoService();
