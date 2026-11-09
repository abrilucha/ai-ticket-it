import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';

/**
 * RatingStars
 * Muestra estrellas de calificación y el puntaje numérico en estilo Pop Art.
 */
export function RatingStars({ puntaje, cantidad, showCount = true, size = 'md', style }) {
  if (puntaje === null || puntaje === undefined) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.sinResenas}>Sin reseñas todavía</Text>
      </View>
    );
  }

  const rounded = Math.round(Number(puntaje));
  const stars = '★'.repeat(Math.max(0, Math.min(5, rounded))) + '☆'.repeat(Math.max(0, 5 - rounded));

  const textStyle = size === 'sm' ? Typography.labelSm : Typography.labelMd;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.starText}>{stars}</Text>
      <Text style={[styles.puntajeNumber, textStyle]}>
        {Number(puntaje).toFixed(1)}
      </Text>
      {showCount && cantidad !== undefined && (
        <Text style={[styles.cantidadText, textStyle]}>
          ({cantidad} {cantidad === 1 ? 'reseña' : 'reseñas'})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  starText: {
    color: Colors.canaryDark,
    fontSize: 16,
    marginRight: 6,
    letterSpacing: 1,
  },
  puntajeNumber: {
    color: Colors.inkBlack,
    marginRight: 4,
  },
  cantidadText: {
    color: Colors.onSurfaceVariant,
  },
  sinResenas: {
    ...Typography.bodyMd,
    color: Colors.outline,
    fontStyle: 'italic',
  },
});
