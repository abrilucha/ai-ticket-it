import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { formatFecha } from '../utils/formato.js';

/**
 * StatusTimeline
 * Línea de tiempo visual para el historial de transiciones de estado de una compra.
 */
export function StatusTimeline({ historial = [], style }) {
  if (!Array.isArray(historial) || historial.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Text style={styles.emptyText}>Sin cambios de estado adicionales registrados.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {historial.map((item, index) => {
        const isLast = index === historial.length - 1;
        const colorConfig = Colors.estados[item.estadoNuevo] || { bg: Colors.electricCobalt };

        return (
          <View key={item.id || index} style={styles.itemRow}>
            {/* Columna del indicador y línea conectora */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colorConfig.bg },
                ]}
              />
              {!isLast && <View style={styles.connectorLine} />}
            </View>

            {/* Columna con la información del cambio */}
            <View style={styles.contentCol}>
              <View style={styles.transitionBadge}>
                <Text style={styles.transitionText}>
                  {item.estadoAnterior ? `${item.estadoAnterior} → ` : ''}
                  <Text style={{ fontWeight: '700' }}>{item.estadoNuevo}</Text>
                </Text>
              </View>

              {item.motivo ? (
                <Text style={styles.motivoText}>{item.motivo}</Text>
              ) : null}

              <Text style={styles.fechaText}>
                {formatFecha(item.fechaHora || item.fecha)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  emptyContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.outline,
    fontStyle: 'italic',
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    zIndex: 2,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.inkBlack,
    marginTop: -2,
    marginBottom: -4,
  },
  contentCol: {
    flex: 1,
    paddingBottom: 4,
  },
  transitionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    marginBottom: 4,
  },
  transitionText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
  },
  motivoText: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
    marginBottom: 2,
  },
  fechaText: {
    ...Typography.bodyMd,
    fontSize: 11,
    color: Colors.outline,
  },
});
