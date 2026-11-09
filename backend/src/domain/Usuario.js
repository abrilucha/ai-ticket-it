export class Usuario {
  constructor({ nombre, apellido, email, rol, favoritos }) {
    this.id = crypto.randomUUID();
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.rol = rol;
    this.favoritos = favoritos ?? [];
  }
}

