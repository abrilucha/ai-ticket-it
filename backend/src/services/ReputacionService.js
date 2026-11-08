import { resenaRepository } from "../repositories/ResenaRepository.js";
import { compraRepository } from "../repositories/CompraRepository.js";
import { eventoRepository } from "../repositories/EventoRepository.js";

export class ReputacionService {
  constructor(
    resRepo = resenaRepository,
    compRepo = compraRepository,
    evRepo = eventoRepository
  ) {
    this.resenaRepository = resRepo;
    this.compraRepository = compRepo;
    this.eventoRepository = evRepo;
  }

  /**
   * Obtiene todas las reseñas vinculadas a eventos del organizador,
   * derivando los datos desde la compra asociada.
   */
  async obtenerResenasOrganizador(organizadorId) {
    const eventos = await this.eventoRepository.findByOrganizador(organizadorId);
    const eventosIds = new Set(eventos.map((e) => e.id));

    const todasResenas = await this.resenaRepository.getAll();
    const resenasOrg = [];

    for (const r of todasResenas) {
      const compra = await this.compraRepository.findById(r.compraId);
      if (!compra) continue;
      const evId = compra.evento?.id || compra.evento;
      if (eventosIds.has(evId)) {
        resenasOrg.push({
          resena: r,
          compra,
          evento: compra.evento,
        });
      }
    }

    return resenasOrg;
  }

  /**
   * Única fuente de verdad para el cálculo del puntaje del organizador.
   * Devuelve { puntajePromedio, cantidadResenas }.
   * Sin reseñas: puntajePromedio = null, cantidadResenas = 0.
   */
  async calcularPuntajeOrganizador(organizadorId) {
    const resenasConDatos = await this.obtenerResenasOrganizador(organizadorId);

    if (resenasConDatos.length === 0) {
      return {
        puntajePromedio: null,
        cantidadResenas: 0,
      };
    }

    const suma = resenasConDatos.reduce((acc, item) => acc + item.resena.puntaje, 0);
    const promedio = Math.round((suma / resenasConDatos.length) * 10) / 10;

    return {
      puntajePromedio: promedio,
      cantidadResenas: resenasConDatos.length,
    };
  }

  /**
   * Obtiene y calcula el promedio de reseñas exclusivo de un evento específico.
   */
  async calcularPuntajeEvento(eventoId) {
    const todasResenas = await this.resenaRepository.getAll();
    const resenasEvento = [];

    for (const r of todasResenas) {
      const compra = await this.compraRepository.findById(r.compraId);
      if (!compra) continue;
      const evId = compra.evento?.id || compra.evento;
      if (evId === eventoId) {
        resenasEvento.push({
          resena: r,
          compra,
          evento: compra.evento,
        });
      }
    }

    if (resenasEvento.length === 0) {
      return {
        puntajePromedio: null,
        cantidadResenas: 0,
        resenasConDatos: [],
      };
    }

    const suma = resenasEvento.reduce((acc, item) => acc + item.resena.puntaje, 0);
    const promedio = Math.round((suma / resenasEvento.length) * 10) / 10;

    return {
      puntajePromedio: promedio,
      cantidadResenas: resenasEvento.length,
      resenasConDatos: resenasEvento,
    };
  }
}

export const reputacionService = new ReputacionService();
