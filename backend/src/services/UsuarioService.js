import { usuarioRepository } from "../repositories/UsuarioRepository.js";

export class UsuarioService {
  constructor(userRepo = usuarioRepository) {
    this.usuarioRepository = userRepo;
  }

  obtenerActual = async (id) => {
    if (!id) return null;
    const u = await this.usuarioRepository.findById(id);
    if (!u) return null;
    return {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      rol: u.rol,
    };
  };
}

export const usuarioService = new UsuarioService();
