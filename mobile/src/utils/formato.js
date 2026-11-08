/**
 * Utilidades de formateo manual sin dependencias externas ni de Intl.
 */

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
];

/**
 * Formatea una fecha ISO a español legible: "sáb 15 mar · 21:00"
 */
export function formatFecha(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);

    const diaNombre = DIAS[d.getDay()];
    const diaNum = d.getDate();
    const mesNombre = MESES[d.getMonth()];
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');

    return `${diaNombre} ${diaNum} ${mesNombre} · ${horas}:${minutos}`;
  } catch {
    return String(isoString);
  }
}

/**
 * Formatea una fecha ISO a formato completo: "sábado 15 de marzo de 2026, 21:00 hs"
 */
export function formatFechaCompleta(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);

    const DIAS_COMPLETOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const MESES_COMPLETOS = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const diaNombre = DIAS_COMPLETOS[d.getDay()];
    const diaNum = d.getDate();
    const mesNombre = MESES_COMPLETOS[d.getMonth()];
    const anio = d.getFullYear();
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');

    return `${diaNombre} ${diaNum} de ${mesNombre} de ${anio}, ${horas}:${minutos} hs`;
  } catch {
    return String(isoString);
  }
}

/**
 * Formatea un número como precio en pesos con separador de miles manual: "$25.000"
 */
export function formatPrecio(monto) {
  if (monto === null || monto === undefined || isNaN(monto)) return '$0';
  const num = Math.round(Number(monto));
  const partes = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${partes}`;
}
