export class Usuario {
  constructor({ nombre, apellido, favoritos }) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.favoritos = favoritos ?? [];
  }
}
