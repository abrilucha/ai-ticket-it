export class Resenia {
  constructor({
    id,
    compraId,
    puntaje,
    comentario,
    fecha = new Date().toISOString(),
  }) {
    this.id = id;
    this.compraId = compraId;
    this.puntaje = puntaje;
    this.comentario = comentario;
    this.fecha = fecha;
  }
}
