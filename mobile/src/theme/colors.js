/**
 * Pop Kinetic Ticketing Color Palette
 * Extraído fielmente del sistema de diseño Pop Art / Lichtenstein y FRONT_PLAN.md
 */

export const Colors = {
  // Paper & Surfaces (Lienzo newsprint y fondos de tarjeta)
  canvasBase: '#FAF8F5',       // Fondo de pantalla, papel prensa sin estucar
  canvasTint: '#FFFDF0',       // Contenedor elevado / tarjeta de ticket
  surfaceDim: '#DBDAD7',       // Gris atenuado para inactivos / fondos neutros
  surfaceContainer: '#EFEEEB', // Contenedor estándar
  surfaceHigh: '#EAE8E5',
  surfaceVariant: '#E4E2DF',
  white: '#FFFFFF',

  // Lichtenstein Primary Graphic Inks
  electricCobalt: '#2563EB',   // CTA primario, estado CONFIRMADA, badges
  cobaltDark: '#004AC6',       // Variante oscura para interacción
  cobaltLight: '#DBE1FF',      // Contenedor tintado suave

  popVermilion: '#F43F5E',     // Magenta / bermellón: alertas, sold out, REEMBOLSADA
  vermilionDark: '#B90538',
  vermilionLight: '#FFDADB',

  canaryYellow: '#FACC15',     // Amarillo canario: acento terciario, starbursts, PENDIENTE
  canaryDark: '#CEA700',
  canaryLight: '#FFE083',

  // Tintas Gráficas y Estructurales
  inkBlack: '#0A0A0A',         // Bordes negros de 2-2.5px, sombras duras (#0A0A0A)
  inkBlackMuted: '#1B1C1A',    // Texto oscuro principal
  onSurface: '#1B1C1A',
  onSurfaceVariant: '#434655', // Texto secundario
  outline: '#737686',          // Bordes sutiles
  outlineVariant: '#C3C6D7',

  // Semánticos generales
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  success: '#10B981',
  successLight: '#D1FAE5',

  // Mapeo EXACTO por Estado de Compra (5 estados canónicos del backend)
  estados: {
    PENDIENTE: {
      bg: '#FACC15',      // canaryYellow
      text: '#0A0A0A',    // inkBlack
      border: '#0A0A0A',
      label: 'PENDIENTE',
    },
    CONFIRMADA: {
      bg: '#2563EB',      // electricCobalt
      text: '#FFFFFF',    // white
      border: '#0A0A0A',
      label: 'CONFIRMADA',
    },
    UTILIZADA: {
      bg: '#DBDAD7',      // surfaceDim
      text: '#1B1C1A',    // inkBlackMuted
      border: '#0A0A0A',
      label: 'UTILIZADA',
    },
    CANCELADA: {
      bg: '#EFEEEB',      // surfaceContainer
      text: '#737686',    // outline
      border: '#737686',
      label: 'CANCELADA',
    },
    REEMBOLSADA: {
      bg: '#FFDADB',      // vermilionLight
      text: '#B90538',    // vermilionDark
      border: '#F43F5E',  // popVermilion
      label: 'REEMBOLSADA',
    },
  },
};
