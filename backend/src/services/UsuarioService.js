import { usuarioRepository } from "../repositories/UsuarioRepository.js";

export class UsuarioService {
  constructor(userRepo = usuarioRepository) {
    this.usuarioRepository = userRepo;
  }

  listar = async () => {
    const usuarios = await this.usuarioRepository.getAll();
    return usuarios.map(({ email, ...u }) => u);
  };

  obtenerActual = async (id) => {
    if (!id) return null;
    return await this.usuarioRepository.findById(id);
  };

  obtenerPorId = async (id) => {
    const u = await this.usuarioRepository.findById(id);
    if (!u) return null;
    const { email, ...sinEmail } = u;
    return sinEmail;
  };
}

export const usuarioService = new UsuarioService();
