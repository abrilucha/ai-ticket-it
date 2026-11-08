import { eventoRepository } from "../repositories/EventoRepository.js";
import { categoriaRepository } from "../repositories/CategoriaRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { compraRepository } from "../repositories/CompraRepository.js";
import { reseniaRepository } from "../repositories/ReseniaRepository.js";
import { reputacionService } from "./ReputacionService.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { Evento } from "../domain/Evento.js";

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class EventoService {
  constructor(
    eventoRepo = eventoRepository,
    catRepo = categoriaRepository,
    userRepo = usuarioRepository,
    compRepo = compraRepository,
    resRepo = reseniaRepository,
    repService = reputacionService
  ) {
    this.eventoRepository = eventoRepo;
    this.categoriaRepository = catRepo;
    this.usuarioRepository = userRepo;
    this.compraRepository = compRepo;
    this.reseniaRepository = resRepo;
    this.reputacionService = repService;
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
      throw new ForbiddenError("Acceso denegado: solo un ORGANIZADOR puede crear eventos");
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
      nombre: tipo.nombre.trim(),
      descripcion: tipo.descripcion || "",
      precio: tipo.precio,
      cupo: tipo.cupo,
      cupoDisponible: tipo.cupo,
    }));

    const eventoDominio = new Evento({
      nombre: nuevo.nombre.trim(),
      descripcion: nuevo.descripcion.trim(),
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

  buscar = async ({ q, categoria, orden, direccion, incluirRealizados }) => {
    // Validar orden y direccion
    const ordenesValidos = ["precio", "fecha", "puntaje"];
    if (orden && !ordenesValidos.includes(orden)) {
      throw new BadRequestError(
        "Parámetro 'orden' inválido: los valores permitidos son precio, fecha o puntaje"
      );
    }

    const direccionesValidas = ["asc", "desc"];
    if (direccion && !direccionesValidas.includes(direccion)) {
      throw new BadRequestError(
        "Parámetro 'direccion' inválido: los valores permitidos son asc o desc"
      );
    }

    // Defaults
    const ordenEfectivo = orden || "fecha";
    const direccionEfectiva = direccion || (ordenEfectivo === "puntaje" ? "desc" : "asc");
    const dir = direccionEfectiva === "desc" ? -1 : 1;

    const filter = {};

    if (q) {
      const qEscapada = escapeRegex(q.trim());
      filter.q = qEscapada
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

    let eventos = await this.eventoRepository.getAll(filter, { fecha: 1 });

    // Enriquecer cada evento con campos calculados
    const ahora = new Date();
    const eventosEnriquecidos = await Promise.all(
      eventos.map(async (ev) => {
        const precios = (ev.tiposEntrada || []).map((t) => t.precio);
        const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;
        const realizado = new Date(ev.fecha) < ahora;

        const orgId =
          ev.organizador?.id || ev.organizador?._id || ev.organizador;
        const reputacion = await this.reputacionService.calcularPuntajeOrganizador(orgId);

        return {
          ...ev,
          precioMinimo,
          realizado,
          puntajeOrganizador: reputacion.puntajePromedio, // number o null (nunca 0.0)
          cantidadResenas: reputacion.cantidadResenas,
        };
      })
    );

    // Filtrar realizados por defecto salvo inclusión explícita
    const debeIncluirRealizados =
      incluirRealizados === true || incluirRealizados === "true";
    let resultado = debeIncluirRealizados
      ? eventosEnriquecidos
      : eventosEnriquecidos.filter((e) => !e.realizado);

    // Ordenamiento
    if (ordenEfectivo === "puntaje") {
      resultado.sort((a, b) => {
        const pA = a.puntajeOrganizador;
        const pB = b.puntajeOrganizador;
        // Los eventos sin reseñas (null) van SIEMPRE al final en asc y desc
        if (pA === null && pB === null) {
          const diffFecha = new Date(a.fecha) - new Date(b.fecha);
          if (diffFecha !== 0) return diffFecha;
          return (a.id || "").localeCompare(b.id || "");
        }
        if (pA === null) return 1;
        if (pB === null) return -1;

        const diffPuntaje = (pA - pB) * dir;
        if (diffPuntaje !== 0) return diffPuntaje;

        const diffFecha = new Date(a.fecha) - new Date(b.fecha);
        if (diffFecha !== 0) return diffFecha;
        return (a.id || "").localeCompare(b.id || "");
      });
    } else if (ordenEfectivo === "precio") {
      resultado.sort((a, b) => {
        const diffPrecio = (a.precioMinimo - b.precioMinimo) * dir;
        if (diffPrecio !== 0) return diffPrecio;
        const diffFecha = new Date(a.fecha) - new Date(b.fecha);
        if (diffFecha !== 0) return diffFecha;
        return (a.id || "").localeCompare(b.id || "");
      });
    } else if (ordenEfectivo === "fecha") {
      resultado.sort((a, b) => {
        const diffFecha = (new Date(a.fecha) - new Date(b.fecha)) * dir;
        if (diffFecha !== 0) return diffFecha;
        return (a.id || "").localeCompare(b.id || "");
      });
    }

    return resultado;
  };

  getById = async (id) => {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new NotFoundError("Evento no encontrado");
    }

    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new NotFoundError("Evento no encontrado");
    }

    const orgId =
      evento.organizador?.id ||
      evento.organizador?._id ||
      evento.organizador;

    // Calcular reputación del organizador y obtener todas sus reseñas
    const reputacionOrg = await this.reputacionService.calcularPuntajeOrganizador(orgId);
    const resenasOrgRaw = await this.reputacionService.obtenerResenasOrganizador(orgId);

    // Ordenadas de más nueva a más vieja
    resenasOrgRaw.sort((a, b) => new Date(b.resena.fecha) - new Date(a.resena.fecha));

    const resenasFormateadas = resenasOrgRaw.map((item) => ({
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

    const organizadorDetallado = {
      id: orgId,
      nombre: evento.organizador?.nombre,
      puntajePromedio: reputacionOrg.puntajePromedio,
      cantidadResenas: reputacionOrg.cantidadResenas,
      resenas: resenasFormateadas,
    };

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

    const precios = (evento.tiposEntrada || []).map((t) => t.precio);
    const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;
    const realizado = new Date(evento.fecha) < new Date();

    return {
      ...evento,
      precioMinimo,
      realizado,
      tiposEntrada: tiposEntradaConDisponibilidad,
      organizador: organizadorDetallado,
    };
  };

  listarCompras = async (eventoId) => {
    const evento = await this.getById(eventoId);
    const comprasRaw = await this.compraRepository.findByEvento(eventoId);

    // Asegurar que ninguna compra exponga mensajes
    const compras = comprasRaw.map((c) => {
      const { mensajes: _omitted, ...sinMensajes } = c;
      return sinMensajes;
    });

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
    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) {
      throw new NotFoundError("Evento no encontrado");
    }

    const { puntajePromedio, cantidadResenas, resenasConDatos } =
      await this.reputacionService.calcularPuntajeEvento(eventoId);

    // Ordenar de más nueva a más vieja
    resenasConDatos.sort((a, b) => new Date(b.resena.fecha) - new Date(a.resena.fecha));

    const resenas = resenasConDatos.map((item) => ({
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

export const eventoService = new EventoService();
