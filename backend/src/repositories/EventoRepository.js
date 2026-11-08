import { EventoModel } from "../mongoschemas/EventoModel.js";

export class EventoRepository {
  async getAll(filter = {}, sort = { fecha: 1 }) {
    return await EventoModel.find(filter)
      .populate("categoria")
      .populate("organizador", "nombre apellido email rol")
      .sort(sort)
      .lean();
  }

  async findById(id) {
    return await EventoModel.findById(id)
      .populate("categoria")
      .populate("organizador", "nombre apellido email rol");
  }

  async findByOrganizador(organizadorId) {
    return await EventoModel.find({ organizador: organizadorId })
      .populate("categoria")
      .populate("organizador", "nombre apellido email rol")
      .sort({ fecha: 1 })
      .lean();
  }

  async save(evento) {
    if (evento.id || evento._id) {
      return await EventoModel.findByIdAndUpdate(evento.id || evento._id, evento, { new: true })
        .populate("categoria")
        .populate("organizador", "nombre apellido email rol");
    }
    const creado = await EventoModel.create(evento);
    return await EventoModel.findById(creado._id)
      .populate("categoria")
      .populate("organizador", "nombre apellido email rol");
  }

  async delete(id) {
    return await EventoModel.findByIdAndDelete(id);
  }
}

export const eventoRepository = new EventoRepository();
