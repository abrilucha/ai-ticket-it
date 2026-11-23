import { apiClient } from './client.js';

/**
 * Registra un nuevo usuario (COMPRADOR u ORGANIZADOR) en el sistema.
 * @param {Object} datos { nombre, apellido, email, password, rol }
 * @returns {Promise<{ token: string, usuario: Object }>}
 */
export async function registrar(datos) {
  return await apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/**
 * Inicia sesión con credenciales.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, usuario: Object }>}
 */
export async function iniciarSesion(email, password) {
  return await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Cierra la sesión activa invalidando el token en el servidor.
 * @returns {Promise<void>}
 */
export async function cerrarSesion() {
  return await apiClient('/auth/logout', {
    method: 'POST',
  });
}

/**
 * Recupera el perfil del usuario autenticado actualmente.
 * @returns {Promise<Object>}
 */
export async function obtenerYo() {
  return await apiClient('/usuarios/me');
}

/**
 * Actualiza los datos del usuario autenticado actualmente (nombre, apellido, email, password, fotoPerfil).
 * @param {Object} datos { nombre, apellido, email, passwordActual, passwordNueva, fotoPerfil }
 * @returns {Promise<Object>}
 */
export async function actualizarPerfil(datos) {
  return await apiClient('/usuarios/me', {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}
