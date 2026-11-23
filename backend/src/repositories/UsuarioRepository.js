import { Usuario } from "../domain/Usuario.js";

export class UsuarioRepository {
  constructor() {
    this.usuarios = [];
  }

  async getAll() {
    return this.usuarios.map((u) => new Usuario(u));
  }

  async findById(id) {
    const raw = this.usuarios.find((u) => u.id === id);
    if (!raw) return null;
    return new Usuario(raw);
  }

  async findByEmail(email) {
    if (!email) return null;
    const normalizado = email.trim().toLowerCase();
    const raw = this.usuarios.find((u) => u.email?.trim().toLowerCase() === normalizado);
    if (!raw) return null;
    return new Usuario(raw);
  }

  async save(usuario) {
    const id = usuario.id;
    const emailNormalizado = usuario.email ? usuario.email.trim().toLowerCase() : usuario.email;
    const favoritosIds = Array.isArray(usuario.favoritos)
      ? usuario.favoritos.map((f) => (typeof f === "object" && f !== null ? f.id || f : f))
      : [];

    const usuarioAguardar = {
      ...usuario,
      email: emailNormalizado,
      favoritos: favoritosIds,
    };
    if (id) {
      const idx = this.usuarios.findIndex((u) => u.id === id);
      if (idx !== -1) {
        this.usuarios[idx] = { ...this.usuarios[idx], ...usuarioAguardar, id };
        return new Usuario(this.usuarios[idx]);
      }
    }
    const nuevoId = id || `usr_${crypto.randomUUID().slice(0, 8)}`;
    const nuevo = {
      ...usuarioAguardar,
      id: nuevoId,
    };
    this.usuarios.push(nuevo);
    return new Usuario(nuevo);
  }

  async delete(id) {
    const idx = this.usuarios.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.usuarios.splice(idx, 1);
      return true;
    }
    return false;
  }

  async clear() {
    this.usuarios = [];
  }
}

export const usuarioRepository = new UsuarioRepository();
