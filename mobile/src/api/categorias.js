import { apiClient } from './client.js';

/**
 * Obtiene el listado de las 5 categorías canónicas del sistema.
 */
export async function listarCategorias() {
  return await apiClient('/categorias');
}
