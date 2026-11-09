import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { RatingStars } from './RatingStars.js';
import { formatFecha } from '../utils/formato.js';

/**
 * ReviewCard
 * Tarjeta de reseña Pop Art que muestra estrellas, comentario, autor,
 * fecha y el nombre del evento evaluado.
 */
export function ReviewCard({ resena, style }) {
  if (!resena) return null;

  return (
    <HardShadow offset={2} borderRadius={8} style={[styles.wrapper, style]}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <RatingStars puntaje={resena.puntaje} showCount={false} size="sm" />
          <Text style={styles.fecha}>{formatFecha(resena.fecha)}</Text>
        </View>

        {resena.evento?.nombre ? (
          <View style={styles.eventoBadge}>
            <Text style={styles.eventoText} numberOfLines={1}>
              🎪 {resena.evento.nombre}
            </Text>
          </View>
        ) : null}

        <Text style={styles.comentario}>"{resena.comentario}"</Text>

        <View style={styles.autorRow}>
          <Text style={styles.autorLabel}>Por:</Text>
          <Text style={styles.autorNombre}>
            {resena.autor?.nombre || 'Comprador verificado'}
          </Text>
        </View>
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fecha: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  eventoBadge: {
    backgroundColor: Colors.surfaceContainer,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.inkBlack,
    marginBottom: 8,
  },
  eventoText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
  },
  comentario: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  autorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  autorLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
    marginRight: 4,
  },
  autorNombre: {
    ...Typography.titleMd,
    fontSize: 12,
    color: Colors.inkBlack,
  },
});
