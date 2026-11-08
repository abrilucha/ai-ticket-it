import { usuarioRepository } from "../repositories/UsuarioRepository.js";

export class UsuarioService {
  constructor(userRepo = usuarioRepository) {
    this.usuarioRepository = userRepo;
  }

  listar = async () => {
    return await this.usuarioRepository.getAll();
  };

  obtenerActual = async (id) => {
    if (!id) return null;
    return await this.usuarioRepository.findById(id);
  };

  obtenerPorId = async (id) => {
    return await this.usuarioRepository.findById(id);
  };
}

export const usuarioService = new UsuarioService();
