export class TipoEntrada {
  constructor({ nombre, descripcion, precio, cupo }) {
    this.id = crypto.randomUUID();
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.cupo = cupo;
  }

  hayCupoPara(cantidad) {
    return this.cupo >= cantidad;
  }
}
