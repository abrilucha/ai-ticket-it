/**
 * Utilidades para generación y lectura de payloads QR en AI Ticket It.
 * Formato de payload: AITICKETIT:<compraId>
 */

const QR_PREFIX = 'AITICKETIT:';

/**
 * Genera el string a codificar en el código QR a partir del ID de una compra.
 * @param {string} compraId Identificador de la compra
 * @returns {string} Payload formateado
 */
export function armarPayloadQR(compraId) {
  if (typeof compraId !== 'string' || compraId.trim().length === 0) {
    throw new Error('El ID de compra debe ser un string no vacío');
  }
  return `${QR_PREFIX}${compraId.trim()}`;
}

/**
 * Decodifica e interpreta el texto leído por el escáner de QR.
 * @param {string} texto Cadena detectada por la cámara
 * @returns {string|null} ID de la compra si el formato es válido, o null si es ajeno/inválido.
 */
export function leerPayloadQR(texto) {
  if (typeof texto !== 'string') {
    return null;
  }
  const limpio = texto.trim();
  if (!limpio.startsWith(QR_PREFIX)) {
    return null;
  }
  const compraId = limpio.slice(QR_PREFIX.length).trim();
  return compraId.length > 0 ? compraId : null;
}
