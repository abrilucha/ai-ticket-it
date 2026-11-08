export class ReseniaRepository {
  constructor() {
    this.resenias = [];
  }

  async getAll() {
    return [...this.resenias];
  }

  async findById(id) {
    return this.resenias.find((r) => r.id === id || r._id === id) || null;
  }

  async findByEvento(eventoId) {
    return this.resenias
      .filter(
        (r) =>
          r.evento?.id === eventoId ||
          r.evento?._id === eventoId ||
          r.evento === eventoId
      )
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }

  async findByCompra(compraId) {
    return (
      this.resenias.find(
        (r) =>
          r.compraId === compraId ||
          r.compra?.id === compraId ||
          r.compra?._id === compraId ||
          r.compra === compraId
      ) || null
    );
  }

  async save(resenia) {
    const id = resenia.id || resenia._id;
    if (id) {
      const idx = this.resenias.findIndex((r) => r.id === id || r._id === id);
      if (idx !== -1) {
        this.resenias[idx] = { ...this.resenias[idx], ...resenia, id, _id: id };
        return this.resenias[idx];
      }
    }
    const nuevoId = id || `res_${crypto.randomUUID().slice(0, 8)}`;
    const nuevo = {
      ...resenia,
      id: nuevoId,
      _id: nuevoId,
      fecha: resenia.fecha || new Date(),
    };
    this.resenias.push(nuevo);
    return nuevo;
  }

  async clear() {
    this.resenias = [];
  }
}

export const reseniaRepository = new ReseniaRepository();
