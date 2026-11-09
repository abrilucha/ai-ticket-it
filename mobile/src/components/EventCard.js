import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { EventImage } from './EventImage.js';
import { RatingStars } from './RatingStars.js';
import { formatFecha, formatPrecio } from '../utils/formato.js';

/**
 * EventCard
 * Tarjeta de evento Pop Kinetic para el catálogo.
 * Muestra imagen, badge de categoría, nombre, fecha, precio mínimo ("Desde $X"),
 * puntaje del organizador y badge "REALIZADO" si aplica.
 */
export function EventCard({ evento, onPress, style }) {
  if (!evento) return null;

  const imagenUri = Array.isArray(evento.multimedia) && evento.multimedia.length > 0
    ? evento.multimedia[0]
    : null;

  const categoriaCodigo = evento.categoria?.codigo || (typeof evento.categoria === 'string' ? evento.categoria : '');
  const categoriaNombre = evento.categoria?.nombre || evento.categoria?.codigo || (typeof evento.categoria === 'string' ? evento.categoria : 'General');

  return (
    <HardShadow offset={4} borderRadius={12} style={[styles.wrapper, style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Imagen de portada */}
        <View style={styles.imageContainer}>
          <EventImage
            uri={imagenUri}
            categoriaCodigo={categoriaCodigo}
            height={160}
          />

          {/* Badge de Categoría flotante con nombre real */}
          <View style={styles.categoriaPill}>
            <Text style={styles.categoriaText}>{categoriaNombre.toUpperCase()}</Text>
          </View>

          {/* Badge de Evento Realizado si aplica */}
          {evento.realizado ? (
            <View style={styles.realizadoPill}>
              <Text style={styles.realizadoText}>REALIZADO</Text>
            </View>
          ) : null}
        </View>

        {/* Cuerpo informativo */}
        <View style={styles.body}>
          <Text style={styles.titulo} numberOfLines={2}>
            {evento.nombre}
          </Text>

          <Text style={styles.fecha}>
            🗓️ {formatFecha(evento.fecha)}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.precioCol}>
              <Text style={styles.precioLabel}>DESDE</Text>
              <Text style={styles.precioValor}>
                {formatPrecio(evento.precioMinimo)}
              </Text>
            </View>

            <View style={styles.ratingCol}>
              <RatingStars
                puntaje={evento.puntajeEvento}
                cantidad={evento.cantidadResenasEvento}
                size="sm"
              />
            </View>
          </View>
        </View>
      </Pressable>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: Colors.surfaceDim,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  categoriaPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.popVermilion,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
  },
  categoriaText: {
    ...Typography.labelSm,
    color: Colors.white,
    fontWeight: '800',
  },
  realizadoPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.popVermilion,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    transform: [{ rotate: '4deg' }],
  },
  realizadoText: {
    ...Typography.labelSm,
    color: Colors.white,
  },
  body: {
    padding: 14,
  },
  titulo: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    marginBottom: 6,
  },
  fecha: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1.5,
    borderColor: Colors.surfaceDim,
    paddingTop: 8,
  },
  precioCol: {
    justifyContent: 'center',
  },
  precioLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
    fontSize: 9,
  },
  precioValor: {
    ...Typography.titleMd,
    color: Colors.electricCobalt,
    fontWeight: '700',
  },
  ratingCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
