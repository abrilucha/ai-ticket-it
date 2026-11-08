export class EventoRepository {
  constructor() {
    this.eventos = [];
  }

  async getAll(filter = {}, sort = { fecha: 1 }) {
    let result = [...this.eventos];

    if (filter.categoria) {
      result = result.filter(
        (e) =>
          e.categoria?.id === filter.categoria ||
          e.categoria === filter.categoria
      );
    }

    if (filter.q) {
      const regex = new RegExp(filter.q, "i");
      result = result.filter((e) => regex.test(e.nombre) || regex.test(e.descripcion));
    }

    if (sort.fecha) {
      result.sort((a, b) => (new Date(a.fecha) - new Date(b.fecha)) * sort.fecha);
    }

    return result;
  }

  async findById(id) {
    return this.eventos.find((e) => e.id === id) || null;
  }

  async findByOrganizador(organizadorId) {
    return this.eventos
      .filter(
        (e) =>
          e.organizador?.id === organizadorId ||
          e.organizador === organizadorId
      )
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }

  async save(evento) {
    const id = evento.id;
    if (id) {
      const idx = this.eventos.findIndex((e) => e.id === id);
      if (idx !== -1) {
        this.eventos[idx] = { ...this.eventos[idx], ...evento, id };
        return this.eventos[idx];
      }
    }
    const nuevoId = id || `evt_${crypto.randomUUID().slice(0, 8)}`;
    const nuevo = {
      ...evento,
      id: nuevoId,
      tiposEntrada: (evento.tiposEntrada || []).map((t, idx) => {
        const tId = t.id || `tipo_${idx + 1}`;
        return {
          ...t,
          id: tId,
          cupoDisponible: t.cupoDisponible !== undefined ? t.cupoDisponible : t.cupo,
        };
      }),
      multimedia: evento.multimedia || [],
    };
    this.eventos.push(nuevo);
    return nuevo;
  }

  async clear() {
    this.eventos = [];
  }
}

export const eventoRepository = new EventoRepository();
