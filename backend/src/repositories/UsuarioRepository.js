export class UsuarioRepository {
  constructor() {
    this.usuarios = [];
  }

  async getAll() {
    return [...this.usuarios];
  }

  async findById(id) {
    return this.usuarios.find((u) => u.id === id) || null;
  }

  async findByEmail(email) {
    return this.usuarios.find((u) => u.email === email) || null;
  }

  async save(usuario) {
    const id = usuario.id;
    if (id) {
      const idx = this.usuarios.findIndex((u) => u.id === id);
      if (idx !== -1) {
        this.usuarios[idx] = { ...this.usuarios[idx], ...usuario, id };
        return this.usuarios[idx];
      }
    }
    const nuevoId = id || `usr_${crypto.randomUUID().slice(0, 8)}`;
    const nuevo = {
      ...usuario,
      id: nuevoId,
    };
    this.usuarios.push(nuevo);
    return nuevo;
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
