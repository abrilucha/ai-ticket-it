import { UsuarioModel } from "../mongoschemas/UsuarioModel.js";

export class UsuarioService {
  listar = async () => {
    return await UsuarioModel.find().lean();
  };

  obtenerActual = async (id) => {
    if (!id) return null;
    return await UsuarioModel.findById(id).lean();
  };

  obtenerPorId = async (id) => {
    return await UsuarioModel.findById(id).lean();
  };
}
