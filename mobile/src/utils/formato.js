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

/**
 * Parsea y valida fecha en formato "DD/MM/AAAA" y hora en formato "HH:MM" (hora local).
 * Valida días por mes, años bisiestos y rangos horarios.
 * Retorna { date: Date | null, error: string | null }.
 */
export function parsearFechaHora(fechaStr, horaStr) {
  if (!fechaStr || !horaStr) {
    return { date: null, error: 'Fecha y hora requeridas' };
  }

  const fMatch = fechaStr.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!fMatch) {
    return { date: null, error: 'Formato de fecha inválido (usá DD/MM/AAAA)' };
  }

  const hMatch = horaStr.trim().match(/^(\d{2}):(\d{2})$/);
  if (!hMatch) {
    return { date: null, error: 'Formato de hora inválido (usá HH:MM)' };
  }

  const dia = parseInt(fMatch[1], 10);
  const mes = parseInt(fMatch[2], 10);
  const anio = parseInt(fMatch[3], 10);
  const hora = parseInt(hMatch[1], 10);
  const minuto = parseInt(hMatch[2], 10);

  if (anio < 2026 || anio > 2100) {
    return { date: null, error: 'El año debe estar entre 2026 y 2100' };
  }

  if (mes < 1 || mes > 12) {
    return { date: null, error: 'Mes inválido (1 a 12)' };
  }

  const diasEnMes = new Date(anio, mes, 0).getDate();
  if (dia < 1 || dia > diasEnMes) {
    return { date: null, error: `Día inválido para el mes especificado (máximo ${diasEnMes})` };
  }

  if (hora < 0 || hora > 23) {
    return { date: null, error: 'Hora inválida (00 a 23)' };
  }

  if (minuto < 0 || minuto > 59) {
    return { date: null, error: 'Minutos inválidos (00 a 59)' };
  }

  const d = new Date(anio, mes - 1, dia, hora, minuto, 0, 0);
  if (isNaN(d.getTime())) {
    return { date: null, error: 'Fecha u hora inválida' };
  }

  return { date: d, error: null };
}
