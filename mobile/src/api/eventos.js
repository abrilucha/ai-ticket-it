import { apiClient } from './client.js';

/**
 * Consulta el catálogo de eventos con filtros dinámicos.
 * Arma la query string únicamente con los parámetros con valor y encodeURIComponent.
 */
export async function listarEventos(filtros = {}) {
  const params = [];

  if (filtros.q && typeof filtros.q === 'string' && filtros.q.trim() !== '') {
    params.push(`q=${encodeURIComponent(filtros.q.trim())}`);
  }

  if (filtros.categoria && typeof filtros.categoria === 'string' && filtros.categoria.trim() !== '') {
    params.push(`categoria=${encodeURIComponent(filtros.categoria.trim())}`);
  }

  if (filtros.orden && typeof filtros.orden === 'string' && filtros.orden.trim() !== '') {
    params.push(`orden=${encodeURIComponent(filtros.orden.trim())}`);
  }

  if (filtros.direccion && typeof filtros.direccion === 'string' && filtros.direccion.trim() !== '') {
    params.push(`direccion=${encodeURIComponent(filtros.direccion.trim())}`);
  }

  if (filtros.incluirRealizados) {
    params.push(`incluirRealizados=true`);
  }

  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return await apiClient(`/eventos${query}`);
}

/**
 * Consulta el detalle de un evento por ID.
 */
export async function obtenerEvento(id) {
  if (!id) throw new Error('ID de evento requerido');
  return await apiClient(`/eventos/${encodeURIComponent(id)}`);
}

/**
 * Publica un nuevo evento con sus tipos de entrada y multimedia (rol ORGANIZADOR).
 */
export async function crearEvento(datos) {
  return await apiClient('/eventos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/**
 * Lista los eventos pertenecientes al organizador autenticado.
 */
export async function listarMisEventos() {
  return await apiClient('/eventos/mios');
}

/**
 * Obtiene las compras registradas y la disponibilidad por tipo de un evento (rol ORGANIZADOR).
 */
export async function listarComprasDeEvento(eventoId) {
  if (!eventoId) throw new Error('ID de evento requerido');
  return await apiClient(`/eventos/${encodeURIComponent(eventoId)}/compras`);
}
