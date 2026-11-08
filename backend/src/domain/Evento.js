export class Evento {
  constructor({ nombre, descripcion, categoria, fecha, tiposEntrada, multimedia, organizador }) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.fecha = fecha;
    this.tiposEntrada = tiposEntrada ?? [];
    this.multimedia = multimedia ?? [];
    this.organizador = organizador;
  }

  tuPrecioEstaEntre(min, max) {
    return this.tiposEntrada.some(tipo => tipo.precio >= min && tipo.precio <= max);
  }
}
