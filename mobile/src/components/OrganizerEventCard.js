import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { EventImage } from './EventImage.js';
import { formatFecha } from '../utils/formato.js';

/**
 * OrganizerEventCard
 * Tarjeta de evento para la pestaña "Mis eventos" del organizador.
 */
export function OrganizerEventCard({ evento, onPress, style }) {
  if (!evento) return null;

  const imagenUri = Array.isArray(evento.multimedia) && evento.multimedia.length > 0
    ? evento.multimedia[0]
    : null;

  const categoriaNombre = evento.categoria?.nombre || 'General';
  const esRealizado = new Date(evento.fecha) < new Date();
  const fechaTexto = formatFecha(evento.fecha);

  // Cupo total sumando los tipos de entrada definidos
  const cupoTotal = Array.isArray(evento.tiposEntrada)
    ? evento.tiposEntrada.reduce((sum, t) => sum + (t.cupo || 0), 0)
    : 0;

  // Entradas vendidas sumando cupo - cupoDisponible de cada tipo
  const totalVendidas = Array.isArray(evento.tiposEntrada)
    ? evento.tiposEntrada.reduce((sum, t) => {
        const cupo = t.cupo || 0;
        const disponible = t.cupoDisponible !== undefined ? t.cupoDisponible : (t.cupoRestante !== undefined ? t.cupoRestante : cupo);
        return sum + Math.max(0, cupo - disponible);
      }, 0)
    : 0;

  return (
    <HardShadow offset={4} borderRadius={12} style={[styles.shadowWrapper, style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.containerPressed,
        ]}
      >
        {/* Imagen de portada */}
        <View style={styles.imageContainer}>
          <EventImage uri={imagenUri} style={styles.image} />
          {/* Badge PRÓXIMO o REALIZADO */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: esRealizado ? '#757575' : '#059669' },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {esRealizado ? 'REALIZADO' : 'PRÓXIMO'}
            </Text>
          </View>
        </View>

        {/* Contenido de la tarjeta */}
        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoriaNombre.toUpperCase()}</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {evento.nombre}
          </Text>

          <Text style={styles.dateText}>🗓️ {fechaTexto}</Text>

          {cupoTotal > 0 && (
            <Text style={styles.cupoText}>
              Entradas vendidas: <Text style={{ fontWeight: '800' }}>{totalVendidas} / {cupoTotal}</Text>
            </Text>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.ventasLink}>VER VENTAS Y COMPRAS →</Text>
          </View>
        </View>
      </Pressable>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  container: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    overflow: 'hidden',
  },
  containerPressed: {
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0A0A0A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
  },
  statusBadgeText: {
    ...Typography.labelSm,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  content: {
    padding: 14,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.canaryYellow,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  categoryText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
  },
  title: {
    ...Typography.headingSm,
    color: Colors.inkBlack,
    marginBottom: 6,
  },
  dateText: {
    ...Typography.bodySm,
    color: Colors.inkBlack,
    fontWeight: '700',
    marginBottom: 4,
  },
  cupoText: {
    ...Typography.bodySm,
    color: '#555555',
    marginBottom: 10,
  },
  footerRow: {
    borderTopWidth: 1.5,
    borderTopColor: '#EBE6DE',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  ventasLink: {
    ...Typography.labelSm,
    color: Colors.electricCobalt,
    fontWeight: '900',
  },
});
