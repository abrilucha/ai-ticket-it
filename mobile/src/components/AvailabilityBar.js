import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { formatPrecio } from '../utils/formato.js';

/**
 * AvailabilityBar
 * Barra visual de disponibilidad de cupo por tipo de entrada para el organizador.
 */
export function AvailabilityBar({ item, style }) {
  if (!item) return null;

  const cupoTotal = item.cupoTotal || 0;
  const cupoRestante = item.cupoRestante !== undefined ? item.cupoRestante : cupoTotal;
  const vendidas = Math.max(0, cupoTotal - cupoRestante);
  const porcentaje = cupoTotal > 0 ? Math.min(100, Math.round((vendidas / cupoTotal) * 100)) : 0;

  // Color de la barra según nivel de ocupación
  let barColor = Colors.canaryYellow;
  if (porcentaje >= 90) {
    barColor = Colors.crimsonPunch;
  } else if (porcentaje >= 50) {
    barColor = Colors.electricCobalt;
  }

  return (
    <HardShadow offset={3} borderRadius={10} style={[styles.shadowWrapper, style]}>
      <View style={styles.container}>
        {/* Encabezado: Nombre y Precio */}
        <View style={styles.headerRow}>
          <Text style={styles.tipoNombre} numberOfLines={1}>
            {item.nombre || 'Tipo de entrada'}
          </Text>
          <Text style={styles.tipoPrecio}>
            {formatPrecio(item.precio)}
          </Text>
        </View>

        {/* Barra de progreso física */}
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${porcentaje}%`,
                backgroundColor: barColor,
              },
            ]}
          />
        </View>

        {/* Resumen numérico inferior */}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            Vendidas: <Text style={styles.boldText}>{vendidas}</Text> / {cupoTotal}
          </Text>
          <Text style={styles.statText}>
            Restantes: <Text style={[styles.boldText, cupoRestante === 0 && styles.agotadoText]}>
              {cupoRestante === 0 ? 'AGOTADAS' : cupoRestante}
            </Text>
          </Text>
          <Text style={styles.percentText}>{porcentaje}%</Text>
        </View>
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    marginBottom: 12,
  },
  container: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipoNombre: {
    ...Typography.bodyMd,
    fontWeight: '800',
    color: Colors.inkBlack,
    flex: 1,
    marginRight: 8,
  },
  tipoPrecio: {
    ...Typography.labelMd,
    color: Colors.electricCobalt,
    fontWeight: '900',
  },
  track: {
    height: 14,
    backgroundColor: '#EBE6DE',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    borderRightWidth: 1.5,
    borderRightColor: Colors.inkBlack,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    ...Typography.bodySm,
    color: Colors.inkBlack,
  },
  boldText: {
    fontWeight: '800',
  },
  agotadoText: {
    color: Colors.crimsonPunch,
  },
  percentText: {
    ...Typography.labelSm,
    color: Colors.electricCobalt,
  },
});
