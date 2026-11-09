import crypto from "crypto";
import { eventoRepository } from "../repositories/EventoRepository.js";
import { categoriaRepository } from "../repositories/CategoriaRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { compraRepository } from "../repositories/CompraRepository.js";
import { resenaRepository } from "../repositories/ResenaRepository.js";
import { reputacionService } from "./ReputacionService.js";
import { compraService } from "./CompraService.js";
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
    resRepo = resenaRepository,
    repService = reputacionService
  ) {
    this.eventoRepository = eventoRepo;
    this.categoriaRepository = catRepo;
    this.usuarioRepository = userRepo;
    this.compraRepository = compRepo;
    this.resenaRepository = resRepo;
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

    let categoria;
    if (typeof nuevo.categoria === "object" && nuevo.categoria !== null) {
      const nombreCat = (nuevo.categoria.nombre || "").trim();
      const descCat = (nuevo.categoria.descripcion || "").trim();
      if (!nombreCat) {
        throw new BadRequestError("El nombre de la categoría es obligatorio");
      }
      categoria = await this.categoriaRepository.save({
        nombre: nombreCat,
        descripcion: descCat,
        codigo: nombreCat.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      });
    } else {
      categoria = await this.categoriaRepository.findById(nuevo.categoria);
      if (!categoria) {
        categoria = await this.categoriaRepository.findByCodigo(nuevo.categoria);
      }
      if (!categoria) {
        throw new BadRequestError("Categoría no encontrada");
      }
    }

    const fechaEvento = new Date(nuevo.fecha);
    if (isNaN(fechaEvento.getTime())) {
      throw new BadRequestError("Fecha de evento inválida");
    }
    if (fechaEvento <= new Date()) {
      throw new BadRequestError("La fecha del evento debe ser a futuro");
    }

    const { email: _orgEmail, passwordHash: _orgHash, ...orgSinEmail } = organizador;

    const tiposEntradaArmados = (nuevo.tiposEntrada || []).map((tipo) => {
      const suffix = crypto.randomUUID().slice(0, 8);
      return {
        id: `tipo_${suffix}`,
        nombre: tipo.nombre.trim(),
        descripcion: tipo.descripcion || "",
        precio: tipo.precio,
        cupo: tipo.cupo,
        cupoDisponible: tipo.cupo,
        cupoRestante: tipo.cupo,
      };
    });

    const eventoDominio = new Evento({
      nombre: nuevo.nombre.trim(),
      descripcion: nuevo.descripcion.trim(),
      categoria: categoria,
      fecha: fechaEvento.toISOString(),
      tiposEntrada: tiposEntradaArmados,
      multimedia: nuevo.multimedia || [],
      organizador: orgSinEmail,
    });

    return await this.eventoRepository.save(eventoDominio);
  };

  /**
   * Única fuente de verdad para el cálculo de cupo disponible y restante por tipo de entrada.
   */
  calcularDisponibilidadTipos = async (evento) => {
    if (!evento || !Array.isArray(evento.tiposEntrada)) return [];
    const compras = await this.compraRepository.findByEvento(evento.id);

    return evento.tiposEntrada.map((t) => {
      const tId = t.id;
      const vendidas = compras
        .filter(
          (c) =>
            (c.tipoEntrada?.tipoEntradaId === tId || c.tipoEntrada?.id === tId) &&
            c.estado !== "CANCELADA" &&
            c.estado !== "REEMBOLSADA"
        )
        .reduce((sum, c) => sum + (c.cantidad || 0), 0);

      const restante = Math.max(0, t.cupo - vendidas);
      return {
        ...t,
        cupoDisponible: restante,
        cupoRestante: restante,
      };
    });
  };

  listarMios = async (organizadorId) => {
    if (!organizadorId) {
      throw new BadRequestError("Se requiere identificación del organizador");
    }
    const eventos = await this.eventoRepository.findByOrganizador(organizadorId);
    return await Promise.all(
      eventos.map(async (ev) => {
        const tiposConDisponibilidad = await this.calcularDisponibilidadTipos(ev);
        const { email: _email, passwordHash: _hash, ...orgSinEmail } = ev.organizador || {};
        return {
          ...ev,
          tiposEntrada: tiposConDisponibilidad,
          organizador: orgSinEmail,
        };
      })
    );
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

        const orgId = ev.organizador?.id || ev.organizador;
        const reputacion = await this.reputacionService.calcularPuntajeOrganizador(orgId);
        const tiposConDisponibilidad = await this.calcularDisponibilidadTipos(ev);
        const { email: _email, passwordHash: _hash, ...orgSinEmail } = ev.organizador || {};

        return {
          ...ev,
          precioMinimo,
          realizado,
          puntajeOrganizador: reputacion.puntajePromedio, // number o null (nunca 0.0)
          cantidadResenas: reputacion.cantidadResenas,
          tiposEntrada: tiposConDisponibilidad,
          organizador: orgSinEmail,
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

    const orgId = evento.organizador?.id || evento.organizador;

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

    const tiposEntradaConDisponibilidad = await this.calcularDisponibilidadTipos(evento);

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

  listarCompras = async (eventoId, organizadorId) => {
    const evento = await this.getById(eventoId);
    const comprasRaw = await this.compraRepository.findByEvento(eventoId);

    // Enriquecer cada compra con las banderas del backend y sanitizar emails
    const compras = await Promise.all(
      comprasRaw.map(async (c) => {
        return await compraService.enriquecerCompra(c, organizadorId, "ORGANIZADOR");
      })
    );

    const disponibilidadPorTipo = (evento.tiposEntrada || []).map((tipo) => {
      return {
        tipoEntradaId: tipo.id,
        nombre: tipo.nombre,
        precio: tipo.precio,
        cupoTotal: tipo.cupo,
        cupoRestante: tipo.cupoRestante,
        cupoDisponible: tipo.cupoDisponible,
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
