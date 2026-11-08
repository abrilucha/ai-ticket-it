export class CompraRepository {
  constructor() {
    this.compras = [];
  }

  async getAll() {
    return [...this.compras];
  }

  async findById(id) {
    return this.compras.find((c) => c.id === id) || null;
  }

  async findByComprador(compradorId) {
    return this.compras
      .filter(
        (c) =>
          c.comprador?.id === compradorId ||
          c.comprador === compradorId
      )
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  async findByEvento(eventoId) {
    return this.compras.filter(
      (c) =>
        c.evento?.id === eventoId ||
        c.evento === eventoId
    );
  }

  async save(compra) {
    const id = compra.id;
    if (id) {
      const idx = this.compras.findIndex((c) => c.id === id);
      if (idx !== -1) {
        this.compras[idx] = { ...this.compras[idx], ...compra, id };
        return this.compras[idx];
      }
    }
    const nuevoId = id || `cmp_${crypto.randomUUID().slice(0, 8)}`;
    const nuevo = {
      ...compra,
      id: nuevoId,
      mensajes: compra.mensajes || [],
      createdAt: new Date().toISOString(),
    };
    this.compras.push(nuevo);
    return nuevo;
  }

  async clear() {
    this.compras = [];
  }
}

export const compraRepository = new CompraRepository();
