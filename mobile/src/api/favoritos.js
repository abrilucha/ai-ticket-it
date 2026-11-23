import { apiClient } from './client.js';

/**
 * Capa de datos para Favoritos (exclusivo para rol COMPRADOR).
 */

export async function listarFavoritos() {
  return await apiClient('/favoritos');
}

export async function agregarFavorito(eventoId) {
  return await apiClient(`/favoritos/${eventoId}`, {
    method: 'POST',
  });
}

export async function quitarFavorito(eventoId) {
  return await apiClient(`/favoritos/${eventoId}`, {
    method: 'DELETE',
  });
}
