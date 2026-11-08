import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { StateBadge } from './StateBadge.js';
import { formatFecha, formatPrecio } from '../utils/formato.js';

/**
 * TicketCard
 * Cupón de ticket troquelado Pop Kinetic para la lista de "Mis compras".
 * Diseñado con muescas circulares y línea perforada sin borderStyle dashed (compatible 100% con Android).
 */
export function TicketCard({ compra, onPress, style }) {
  if (!compra) return null;

  const eventoNombre = compra.evento?.nombre || 'Evento sin título';
  const fechaTexto = formatFecha(compra.evento?.fecha);
  const tipoNombre = compra.tipoEntrada?.nombre || 'Entrada General';
  const cantidad = compra.cantidad || 1;
  const total = compra.total || 0;

  // Contador de días para compras CONFIRMADAS
  let countdownText = null;
  if (compra.estado === 'CONFIRMADA' && compra.diasRestantes !== null && compra.diasRestantes !== undefined) {
    countdownText = compra.diasRestantes === 0 ? '¡Es hoy!' : `Faltan ${compra.diasRestantes} días`;
  }

  return (
    <HardShadow offset={4} borderRadius={12} style={[styles.shadowWrapper, style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.containerPressed,
        ]}
      >
        {/* Sección superior: Evento y Estado */}
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.titleCol}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {eventoNombre}
              </Text>
              <Text style={styles.eventDate}>🗓️ {fechaTexto}</Text>
            </View>
            <View style={styles.badgeCol}>
              <StateBadge estado={compra.estado} />
              {countdownText && (
                <View style={styles.countdownPill}>
                  <Text style={styles.countdownText}>⏳ {countdownText}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Muescas troqueladas y línea perforada física */}
        <View style={styles.perforationContainer}>
          <View style={styles.notchLeft} />
          <View style={styles.perforationRow}>
            {Array.from({ length: 22 }).map((_, i) => (
              <View key={i} style={styles.perforationDot} />
            ))}
          </View>
          <View style={styles.notchRight} />
        </View>

        {/* Sección inferior: Tipo de entrada, cantidad y total */}
        <View style={styles.bottomSection}>
          <View style={styles.detailCol}>
            <Text style={styles.tierText}>
              🎟️ {cantidad}x {tipoNombre}
            </Text>
            {compra.montoReembolsado > 0 ? (
              <Text style={styles.reembolsoSub}>
                Reembolsado: {formatPrecio(compra.montoReembolsado)}
              </Text>
            ) : null}
          </View>

          <View style={styles.totalCol}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalText}>{formatPrecio(total)}</Text>
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
    position: 'relative',
    overflow: 'hidden',
  },
  containerPressed: {
    backgroundColor: Colors.surfaceDim,
  },
  topSection: {
    padding: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    marginBottom: 4,
  },
  eventDate: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  badgeCol: {
    alignItems: 'flex-end',
  },
  countdownPill: {
    backgroundColor: Colors.canaryYellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    marginTop: 6,
  },
  countdownText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    fontWeight: '700',
  },
  perforationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    position: 'relative',
  },
  notchLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.canvasBase,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    position: 'absolute',
    left: -11,
    zIndex: 2,
  },
  notchRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.canvasBase,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    position: 'absolute',
    right: -11,
    zIndex: 2,
  },
  perforationRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  perforationDot: {
    width: 5,
    height: 2,
    backgroundColor: Colors.outline,
    borderRadius: 1,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
  },
  detailCol: {
    flex: 1,
  },
  tierText: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
  },
  reembolsoSub: {
    ...Typography.bodyMd,
    color: Colors.popVermilion,
    marginTop: 2,
  },
  totalCol: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
    fontSize: 9,
  },
  totalText: {
    ...Typography.titleLg,
    color: Colors.electricCobalt,
    fontWeight: '700',
  },
});
