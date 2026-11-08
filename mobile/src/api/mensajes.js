import { apiClient } from './client.js';

/**
 * Lista los mensajes del chat de una compra.
 * Devuelve un array de objetos con: { id, compraId, autor: { id, nombre, rol }, texto, fecha, esPropio }
 */
export async function listarMensajes(compraId) {
  if (!compraId) throw new Error('ID de compra requerido');
  return await apiClient(`/compras/${encodeURIComponent(compraId)}/mensajes`);
}

/**
 * Envía un nuevo mensaje al chat de una compra.
 * @param {string} compraId - ID de la compra.
 * @param {string} texto - Contenido del mensaje (1 a 1000 caracteres).
 */
export async function enviarMensaje(compraId, texto) {
  if (!compraId) throw new Error('ID de compra requerido');
  return await apiClient(`/compras/${encodeURIComponent(compraId)}/mensajes`, {
    method: 'POST',
    body: JSON.stringify({ texto }),
  });
}
