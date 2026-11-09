import { API_URL } from './config.js';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let getUserIdCallback = () => null;
let onUnauthorizedCallback = () => {};

/**
 * Vincula el cliente HTTP con la sesión activa de AuthContext.
 */
export function setAuthHandlers({ getUserId, onUnauthorized }) {
  if (getUserId) getUserIdCallback = getUserId;
  if (onUnauthorized) onUnauthorizedCallback = onUnauthorized;
}

/**
 * Cliente HTTP base para AI Ticket It.
 * Timeout de 8 segundos, inyección de x-user-id, parseo de { error: { code, message } }
 * y detección de 401 para cierre automático de sesión.
 */
export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const userId = getUserIdCallback();
  if (userId && !headers['x-user-id']) {
    headers['x-user-id'] = userId;
  }

  const controller = new AbortController();
  const timeoutMs = options.timeout || 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Si devuelve 401 en una ruta autenticada, notificar al AuthContext para desloguear
    if (response.status === 401 && endpoint !== '/usuarios' && endpoint !== '/health') {
      onUnauthorizedCallback();
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    }

    if (!response.ok) {
      const code = data?.error?.code || 'ERROR_SERVIDOR';
      const message = data?.error?.message || data?.message || `Error en la solicitud (${response.status})`;
      throw new ApiError(response.status, code, message);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError(
        408,
        'TIMEOUT',
        'El servidor tardó demasiado en responder (tiempo límite de 8s superado). Verificá tu conexión.'
      );
    }

    throw new ApiError(
      0,
      'CONEXION_FALLIDA',
      'No se pudo conectar con el servidor. Verificá que el celular y la PC estén en la misma red WiFi y que el backend esté corriendo en la IP configurada.'
    );
  }
}
