import { apiClient } from './client.js';

/**
 * Consulta las reseñas y puntaje acumulado de un organizador.
 */
export async function obtenerResenasOrganizador(id) {
  if (!id) throw new Error('ID de organizador requerido');
  return await apiClient(`/organizadores/${encodeURIComponent(id)}/resenas`);
}
