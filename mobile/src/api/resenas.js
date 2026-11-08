import { apiClient, ApiError } from './client.js';

/**
 * Obtiene la reseña dejada para una compra específica.
 * Si aún no fue calificada, la API devuelve 404 RESENA_NO_ENCONTRADA;
 * esta función atrapa dicho error y devuelve null limpiamente.
 */
export async function obtenerResenaDeCompra(compraId) {
  if (!compraId) throw new Error('ID de compra requerido');
  try {
    return await apiClient(`/compras/${encodeURIComponent(compraId)}/resena`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Crea una reseña para una compra en estado UTILIZADA.
 * @param {string} compraId - ID de la compra.
 * @param {{ puntaje: number, comentario: string }} datos
 */
export async function crearResena(compraId, { puntaje, comentario }) {
  if (!compraId) throw new Error('ID de compra requerido');
  return await apiClient(`/compras/${encodeURIComponent(compraId)}/resena`, {
    method: 'POST',
    body: JSON.stringify({
      puntaje,
      comentario,
    }),
  });
}
