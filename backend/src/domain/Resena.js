export class Resena {
  constructor({
    compraId,
    puntaje,
    comentario,
    fecha = new Date().toISOString(),
  }) {
    this.id = crypto.randomUUID();
    this.compraId = compraId;
    this.puntaje = puntaje;
    this.comentario = comentario;
    this.fecha = fecha;
  }
}
