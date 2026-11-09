export class Mensaje {
  constructor({ compraId, autorId, texto, fecha = new Date().toISOString() }) {
    this.id = crypto.randomUUID();
    this.compraId = compraId;
    this.autorId = autorId;
    this.texto = texto;
    this.fecha = fecha;
  }
}
