export class Categoria {
  constructor({ nombre, descripcion, codigo }) {
    this.id = crypto.randomUUID();
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.codigo = codigo;
  }
}
