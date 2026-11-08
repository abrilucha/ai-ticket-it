export class Mensaje {
  constructor({ id, compraId, autorId, texto, fecha = new Date().toISOString() }) {
    this.id = id;
    this.compraId = compraId;
    this.autorId = autorId;
    this.texto = texto;
    this.fecha = fecha;
  }
}
