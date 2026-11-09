import { EstadoCompra } from './EstadoCompra.js';

export class Compra {
  constructor({ comprador, evento, tipoEntrada, cantidad, total, estado = EstadoCompra.PENDIENTE, mensajes }) {
    this.id = crypto.randomUUID();
    this.comprador = comprador;
    this.evento = evento;
    this.tipoEntrada = tipoEntrada;
    this.cantidad = cantidad;
    this.total = total;
    this.estado = estado;
    this.mensajes = mensajes ?? [];
  }

  actualizarEstado(nuevoEstado) {
    this.estado = nuevoEstado;
  }
}
