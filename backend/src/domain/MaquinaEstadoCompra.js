import { EstadoCompra } from "./EstadoCompra.js";
import { ConflictError } from "../errors/ConflictError.js";

export class MaquinaEstadoCompra {
  static transicionar(compraOEstado, accion) {
    const estadoActual =
      typeof compraOEstado === "object" && compraOEstado !== null
        ? compraOEstado.estado
        : compraOEstado;

    let accionNormalizada = accion;
    if (accion === EstadoCompra.CONFIRMADA) accionNormalizada = "PAGAR";
    if (accion === EstadoCompra.UTILIZADA) accionNormalizada = "UTILIZAR";
    if (accion === EstadoCompra.CANCELADA || accion === EstadoCompra.REEMBOLSADA) {
      accionNormalizada = "CANCELAR";
    }

    switch (accionNormalizada) {
      case "PAGAR":
        if (estadoActual === EstadoCompra.CONFIRMADA) {
          throw new ConflictError("La compra ya se encuentra confirmada y pagada");
        }
        if (estadoActual === EstadoCompra.UTILIZADA) {
          throw new ConflictError("No se puede pagar una entrada que ya fue utilizada");
        }
        if (estadoActual === EstadoCompra.CANCELADA || estadoActual === EstadoCompra.REEMBOLSADA) {
          throw new ConflictError(`No se puede pagar una compra en estado ${estadoActual}`);
        }
        if (estadoActual !== EstadoCompra.PENDIENTE) {
          throw new ConflictError(`Transición inválida: no se puede pagar en estado ${estadoActual}`);
        }
        return EstadoCompra.CONFIRMADA;

      case "UTILIZAR":
        if (estadoActual === EstadoCompra.UTILIZADA) {
          throw new ConflictError("La entrada ya ha sido utilizada previamente");
        }
        if (estadoActual === EstadoCompra.PENDIENTE) {
          throw new ConflictError("No se puede utilizar una entrada con pago pendiente");
        }
        if (estadoActual === EstadoCompra.CANCELADA || estadoActual === EstadoCompra.REEMBOLSADA) {
          throw new ConflictError(`No se puede utilizar una entrada ${estadoActual.toLowerCase()}`);
        }
        if (estadoActual !== EstadoCompra.CONFIRMADA) {
          throw new ConflictError(`Transición inválida: no se puede utilizar en estado ${estadoActual}`);
        }
        return EstadoCompra.UTILIZADA;

      case "CANCELAR":
        if (estadoActual === EstadoCompra.UTILIZADA) {
          throw new ConflictError("No se puede cancelar una compra cuya entrada ya fue utilizada (Regla S8)");
        }
        if (estadoActual === EstadoCompra.CANCELADA || estadoActual === EstadoCompra.REEMBOLSADA) {
          throw new ConflictError(`La compra ya se encuentra ${estadoActual.toLowerCase()}`);
        }
        if (estadoActual === EstadoCompra.CONFIRMADA) {
          return EstadoCompra.REEMBOLSADA;
        }
        if (estadoActual === EstadoCompra.PENDIENTE) {
          return EstadoCompra.CANCELADA;
        }
        throw new ConflictError(`Transición inválida: no se puede cancelar en estado ${estadoActual}`);

      default:
        throw new ConflictError(`Acción desconocida en la máquina de estados: ${accion}`);
    }
  }
}
