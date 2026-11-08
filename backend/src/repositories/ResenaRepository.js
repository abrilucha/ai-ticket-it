export class ResenaRepository {
  constructor() {
    this.resenas = [];
  }

  async getAll() {
    return [...this.resenas];
  }

  async findById(id) {
    return this.resenas.find((r) => r.id === id) || null;
  }

  async findByEvento(eventoId) {
    return this.resenas
      .filter((r) => r.eventoId === eventoId || r.evento?.id === eventoId || r.evento === eventoId)
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }

  async findByCompra(compraId) {
    return (
      this.resenas.find(
        (r) =>
          r.compraId === compraId ||
          r.compra?.id === compraId ||
          r.compra === compraId
      ) || null
    );
  }

  async save(resena) {
    const id = resena.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const idx = this.resenas.findIndex((r) => r.id === id);
    const nueva = {
      ...resena,
      id,
      fecha: resena.fecha || new Date().toISOString(),
    };

    if (idx !== -1) {
      this.resenas[idx] = nueva;
      return this.resenas[idx];
    }

    this.resenas.push(nueva);
    return nueva;
  }

  async clear() {
    this.resenas = [];
  }
}

export const resenaRepository = new ResenaRepository();
