import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { StateBadge } from './StateBadge.js';
import { PopButton } from './PopButton.js';
import { formatFecha, formatPrecio } from '../utils/formato.js';

/**
 * CompraRowOrganizador
 * Fila de compra en la pantalla de "Ventas del evento".
 * Muestra el nombre del comprador (NUNCA el email), tipo de entrada, total, estado
 * y la acción para marcar como utilizada si corresponde.
 */
export function CompraRowOrganizador({
  compra,
  onPress,
  onSolicitarUtilizar,
  isProcessing = false,
  style,
}) {
  if (!compra) return null;

  const compradorNombre = compra.comprador?.nombre
    ? `${compra.comprador.nombre} ${compra.comprador.apellido || ''}`.trim()
    : 'Comprador anónimo';

  const tipoNombre = compra.tipoEntrada?.nombre || 'General';
  const cantidad = compra.cantidad || 1;
  const total = compra.total || 0;
  const fechaCompra = compra.createdAt ? formatFecha(compra.createdAt) : null;

  // El front respeta exclusivamente la bandera que garantiza el backend
  const puedeUtilizar = Boolean(compra.puedeUtilizar);

  return (
    <HardShadow offset={3} borderRadius={10} style={[styles.shadowWrapper, style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.containerPressed,
        ]}
      >
        {/* Cabecera: Nombre de comprador y StateBadge */}
        <View style={styles.headerRow}>
          <View style={styles.buyerCol}>
            <Text style={styles.buyerName} numberOfLines={1}>
              👤 {compradorNombre}
            </Text>
            {fechaCompra && (
              <Text style={styles.dateSub}>Comprado el {fechaCompra}</Text>
            )}
          </View>
          <StateBadge estado={compra.estado} />
        </View>

        {/* Separador sutil */}
        <View style={styles.divider} />

        {/* Detalle de entradas y total */}
        <View style={styles.detailRow}>
          <Text style={styles.tierText}>
            🎟️ {cantidad}x {tipoNombre}
          </Text>
          <Text style={styles.totalText}>
            {formatPrecio(total)}
          </Text>
        </View>

        {/* Botón de acción si puede utilizarse */}
        {puedeUtilizar && (
          <View style={styles.actionRow}>
            <PopButton
              title="✓ MARCAR COMO UTILIZADA"
              variant="canary"
              size="sm"
              loading={isProcessing}
              disabled={isProcessing}
              onPress={() => onSolicitarUtilizar(compra)}
            />
          </View>
        )}
      </Pressable>
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
  containerPressed: {
    backgroundColor: '#F3EFEA',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buyerCol: {
    flex: 1,
    marginRight: 8,
  },
  buyerName: {
    ...Typography.bodyMd,
    fontWeight: '800',
    color: Colors.inkBlack,
  },
  dateSub: {
    ...Typography.bodySm,
    color: '#666666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBE6DE',
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierText: {
    ...Typography.bodySm,
    fontWeight: '700',
    color: Colors.inkBlack,
  },
  totalText: {
    ...Typography.labelMd,
    fontWeight: '900',
    color: Colors.electricCobalt,
  },
  actionRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EBE6DE',
  },
});
