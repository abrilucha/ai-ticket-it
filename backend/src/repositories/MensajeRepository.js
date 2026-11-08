export class MensajeRepository {
  constructor() {
    this.mensajes = [];
  }

  async getAll() {
    return [...this.mensajes];
  }

  async findByCompraId(compraId) {
    return this.mensajes
      .filter((m) => m.compraId === compraId)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }

  async save(mensaje) {
    const id =
      mensaje.id ||
      mensaje._id ||
      `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fecha = mensaje.fecha || new Date().toISOString();

    const idx = this.mensajes.findIndex((m) => m.id === id || m._id === id);
    const entidad = {
      ...mensaje,
      id,
      _id: id,
      fecha,
    };

    if (idx !== -1) {
      this.mensajes[idx] = entidad;
    } else {
      this.mensajes.push(entidad);
    }

    return entidad;
  }

  async clear() {
    this.mensajes = [];
  }
}

export const mensajeRepository = new MensajeRepository();
