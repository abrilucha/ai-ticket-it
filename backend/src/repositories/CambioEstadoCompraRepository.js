export class CambioEstadoCompraRepository {
  constructor() {
    this.cambios = [];
  }

  async getAll() {
    return [...this.cambios];
  }

  async findByCompra(compraId) {
    return this.cambios
      .filter((c) => c.compra?.id === compraId || c.compraId === compraId || c.compra === compraId)
      .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
  }

  async save(cambio) {
    const id = cambio.id;
    const nuevoId = id || `cam_${crypto.randomUUID().slice(0, 8)}`;
    const nuevo = {
      ...cambio,
      id: nuevoId,
      fechaHora: cambio.fechaHora || new Date(),
    };
    this.cambios.push(nuevo);
    return nuevo;
  }

  async clear() {
    this.cambios = [];
  }
}

export const cambioEstadoCompraRepository = new CambioEstadoCompraRepository();
