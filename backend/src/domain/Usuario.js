export class Usuario {
  constructor({ id, nombre, apellido, email, rol, passwordHash, favoritos, fotoPerfil }) {
    this.id = id || `usr_${crypto.randomUUID().slice(0, 8)}`;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email ? email.trim().toLowerCase() : email;
    this.rol = rol;
    this.passwordHash = passwordHash;
    this.favoritos = Array.isArray(favoritos) ? favoritos : [];
    this.fotoPerfil = fotoPerfil ?? null;
  }

  esFavorito(eventoId) {
    if (!Array.isArray(this.favoritos) || !eventoId) return false;
    return this.favoritos.some((fav) => (fav?.id || fav) === eventoId);
  }

  agregarFavorito(evento) {
    if (!Array.isArray(this.favoritos)) {
      this.favoritos = [];
    }
    const eventoId = evento?.id || evento;
    if (!eventoId) return false;
    const yaExiste = this.esFavorito(eventoId);
    if (yaExiste) return false;
    const objetoAGuardar = typeof evento === "object" && evento !== null ? evento : { id: eventoId };
    this.favoritos.push(objetoAGuardar);
    return true;
  }

  quitarFavorito(eventoId) {
    if (!Array.isArray(this.favoritos) || !eventoId) return false;
    const idx = this.favoritos.findIndex((fav) => (fav?.id || fav) === eventoId);
    if (idx !== -1) {
      this.favoritos.splice(idx, 1);
      return true;
    }
    return false;
  }

  obtenerFavoritosRecientes() {
    if (!Array.isArray(this.favoritos)) return [];
    return [...this.favoritos].reverse();
  }
}


