import { UsuarioModel } from "../mongoschemas/UsuarioModel.js";

export class UsuarioRepository {
  async getAll() {
    return await UsuarioModel.find().lean();
  }

  async findById(id) {
    return await UsuarioModel.findById(id);
  }

  async findByEmail(email) {
    return await UsuarioModel.findOne({ email });
  }

  async save(usuario) {
    if (usuario.id || usuario._id) {
      return await UsuarioModel.findByIdAndUpdate(usuario.id || usuario._id, usuario, { new: true });
    }
    return await UsuarioModel.create(usuario);
  }
}

export const usuarioRepository = new UsuarioRepository();
