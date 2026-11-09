export class Usuario {
  constructor({ id, nombre, apellido, email, rol, passwordHash, favoritos }) {
    this.id = id || `usr_${crypto.randomUUID().slice(0, 8)}`;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email ? email.trim().toLowerCase() : email;
    this.rol = rol;
    this.passwordHash = passwordHash;
    this.favoritos = favoritos ?? [];
  }
}


