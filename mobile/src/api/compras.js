import { apiClient } from './client.js';

/**
 * Crea una nueva compra en estado PENDIENTE.
 */
export async function crearCompra({ eventoId, tipoEntradaId, cantidad }) {
  return await apiClient('/compras', {
    method: 'POST',
    body: JSON.stringify({
      eventoId,
      tipoEntradaId,
      cantidad,
    }),
  });
}

/**
 * Confirma el pago simulado de una compra en estado PENDIENTE.
 */
export async function pagarCompra(id) {
  if (!id) throw new Error('ID de compra requerido');
  return await apiClient(`/compras/${encodeURIComponent(id)}/pagar`, {
    method: 'POST',
  });
}

/**
 * Lista las compras del comprador autenticado.
 */
export async function listarMisCompras() {
  return await apiClient('/compras/mias');
}

/**
 * Obtiene el detalle de una compra con su historial y banderas.
 */
export async function obtenerCompra(id) {
  if (!id) throw new Error('ID de compra requerido');
  return await apiClient(`/compras/${encodeURIComponent(id)}`);
}

/**
 * Cancela una compra (pasa a CANCELADA o REEMBOLSADA y libera cupo).
 */
export async function cancelarCompra(id) {
  if (!id) throw new Error('ID de compra requerido');
  return await apiClient(`/compras/${encodeURIComponent(id)}/cancelar`, {
    method: 'POST',
  });
}
