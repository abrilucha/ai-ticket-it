import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useCompra } from '../../hooks/useCompra.js';
import { pagarCompra, cancelarCompra } from '../../api/compras.js';
import { Screen } from '../../components/Screen.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopButton } from '../../components/PopButton.js';
import { StateBadge } from '../../components/StateBadge.js';
import { StatusTimeline } from '../../components/StatusTimeline.js';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';
import { formatFechaCompleta, formatPrecio } from '../../utils/formato.js';

export function CompraDetalleScreen({ route, navigation }) {
  const { id, origen } = route.params || {};
  const { data: compra, loading, error, reload } = useCompra(id);

  // Recargar al recibir foco
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // Estados de operaciones de pago y cancelación
  const [pagando, setPagando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [accionError, setAccionError] = useState(null);

  // Acción Pagar (simulado) con protección contra doble toque
  const handlePagar = async () => {
    if (pagando || !compra || !compra.puedePagar) return;
    setPagando(true);
    setAccionError(null);

    try {
      await pagarCompra(compra.id);
      await reload();
    } catch (err) {
      setAccionError(err.message || 'Error al procesar el pago.');
      reload();
    } finally {
      setPagando(false);
    }
  };

  // Acción Cancelar con protección contra doble toque
  const handleConfirmarCancelar = async () => {
    if (cancelando || !compra || !compra.puedeCancelar) return;
    setCancelando(true);
    setAccionError(null);

    try {
      await cancelarCompra(compra.id);
      setCancelModalVisible(false);
      await reload();
    } catch (err) {
      setAccionError(err.message || 'Error al procesar la cancelación.');
      reload();
    } finally {
      setCancelando(false);
    }
  };

  const handleVolver = () => {
    if (origen === 'compra_nueva') {
      // Si vino de una compra recién creada, volver al catálogo o mis compras
      navigation.navigate('Catalogo');
    } else {
      navigation.goBack();
    }
  };

  if (loading && !compra) {
    return (
      <Screen>
        <LoadingView message="Cargando comprobante de compra..." />
      </Screen>
    );
  }

  if (error && !compra) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <ErrorBanner message={error} onRetry={reload} />
          <PopButton
            title="← VOLVER"
            variant="secondary"
            size="sm"
            onPress={handleVolver}
            style={styles.backBtnWrapper}
          />
        </View>
      </Screen>
    );
  }

  if (!compra) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <EmptyState
            icon="🎟️"
            title="COMPRA NO ENCONTRADA"
            subtitle="La compra solicitada no existe o no tenés permiso para verla."
            action={
              <PopButton
                title="← VOLVER"
                variant="primary"
                size="sm"
                onPress={handleVolver}
              />
            }
          />
        </View>
      </Screen>
    );
  }

  const eventoNombre = compra.evento?.nombre || 'Evento';
  const fechaCompleta = formatFechaCompleta(compra.evento?.fecha);
  const tipoNombre = compra.tipoEntrada?.nombre || 'General';
  const cantidad = compra.cantidad || 1;
  const total = compra.total || 0;

  // Contador de días para compras CONFIRMADAS
  let countdownText = null;
  if (compra.estado === 'CONFIRMADA' && compra.diasRestantes !== null && compra.diasRestantes !== undefined) {
    countdownText = compra.diasRestantes === 0 ? '¡Es hoy!' : `Faltan ${compra.diasRestantes} días`;
  }

  // Texto del modal según estado
  const cancelModalMensaje = compra.estado === 'PENDIENTE'
    ? 'Se cancelará la reserva y se liberarán las entradas de inmediato.'
    : `Se te reembolsará ${formatPrecio(total)} y se liberarán las entradas.`;

  return (
    <Screen>
      {/* Barra superior fija en la esquina */}
      <View style={styles.topFixedBar}>
        <HardShadow offset={2} borderRadius={8}>
          <Pressable onPress={handleVolver} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backButtonText}>← VOLVER</Text>
          </Pressable>
        </HardShadow>
        <Text style={styles.screenTag}>DETALLE DE COMPRA</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Banner de error si falló pago o cancelación */}
        {accionError ? (
          <ErrorBanner message={accionError} onRetry={() => setAccionError(null)} />
        ) : null}

        {/* Tarjeta Principal del Ticket */}
        <HardShadow offset={4} borderRadius={14} style={styles.mainCardShadow}>
          <View style={styles.mainCard}>
            {/* Header del Ticket */}
            <View style={styles.ticketHeader}>
              <View style={styles.badgeRow}>
                <StateBadge estado={compra.estado} />
                {countdownText && (
                  <View style={styles.countdownBadge}>
                    <Text style={styles.countdownText}>⏳ {countdownText}</Text>
                  </View>
                )}
              </View>

              {/* Título de evento cliqueable hacia el detalle */}
              <Pressable
                onPress={() => {
                  if (compra.evento?.id) {
                    navigation.navigate('EventoDetalle', { id: compra.evento.id });
                  }
                }}
              >
                <Text style={styles.eventTitle}>{eventoNombre}</Text>
                <Text style={styles.verEventoLink}>Ver detalle del evento →</Text>
              </Pressable>

              <Text style={styles.eventDate}>🗓️ {fechaCompleta}</Text>
            </View>

            {/* Separador de corte */}
            <View style={styles.divider} />

            {/* Desglose de entradas */}
            <View style={styles.ticketBody}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TIPO DE ENTRADA:</Text>
                <Text style={styles.infoVal}>{tipoNombre}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CANTIDAD:</Text>
                <Text style={styles.infoVal}>{cantidad} {cantidad === 1 ? 'entrada' : 'entradas'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PRECIO UNITARIO:</Text>
                <Text style={styles.infoVal}>
                  {formatPrecio(compra.tipoEntrada?.precio || (total / cantidad))}
                </Text>
              </View>

              <View style={[styles.infoRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL A PAGAR:</Text>
                <Text style={styles.totalVal}>{formatPrecio(total)}</Text>
              </View>

              {/* Aviso de reembolso si corresponde */}
              {compra.montoReembolsado > 0 && (
                <View style={styles.reembolsoBox}>
                  <Text style={styles.reembolsoTitle}>✓ REEMBOLSO REGISTRADO</Text>
                  <Text style={styles.reembolsoText}>
                    Monto devuelto: {formatPrecio(compra.montoReembolsado)}
                  </Text>
                </View>
              )}
            </View>

            {/* Bloque informativo de estado UTILIZADA */}
            {compra.estado === 'UTILIZADA' && (
              <View style={styles.utilizadaBox}>
                <Text style={styles.utilizadaText}>
                  Entrada utilizada en el acceso: ya no se puede cancelar ni reembolsar.
                </Text>
              </View>
            )}
          </View>
        </HardShadow>

        {/* Acciones principales: Pagar y Cancelar */}
        <View style={styles.actionsBlock}>
          {/* Botón PAGAR si puedePagar es true */}
          {compra.puedePagar ? (
            <View style={styles.actionBtnSlot}>
              <PopButton
                title={`PAGAR ${formatPrecio(total)}`}
                variant="primary"
                size="lg"
                loading={pagando}
                disabled={pagando}
                onPress={handlePagar}
              />
              <Text style={styles.avisoSimulado}>
                💡 Pago simulado: no se realiza ningún cobro real con tarjeta.
              </Text>
            </View>
          ) : null}

          {/* Botón CANCELAR si puedeCancelar es true */}
          {compra.puedeCancelar ? (
            <View style={styles.actionBtnSlot}>
              <PopButton
                title="CANCELAR COMPRA"
                variant="danger"
                size="md"
                disabled={cancelando}
                onPress={() => setCancelModalVisible(true)}
              />
            </View>
          ) : null}
        </View>

        {/* Historial de estados (Línea de tiempo) */}
        <View style={styles.timelineBlock}>
          <Text style={styles.timelineHeading}>HISTORIAL DE ESTADOS</Text>
          <StatusTimeline historial={compra.historialEstados} />
        </View>
      </ScrollView>

      {/* Modal de confirmación de Cancelación */}
      <ConfirmModal
        visible={cancelModalVisible}
        title="¿CANCELAR COMPRA?"
        message={cancelModalMensaje}
        confirmText="SÍ, CANCELAR"
        cancelText="NO, VOLVER"
        variant="danger"
        loading={cancelando}
        onConfirm={handleConfirmarCancelar}
        onCancel={() => setCancelModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  topFixedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.canvasBase,
    borderBottomWidth: 1.5,
    borderColor: Colors.inkBlack,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
  },
  screenTag: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  mainCardShadow: {
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 14,
    padding: 16,
  },
  ticketHeader: {
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  countdownBadge: {
    backgroundColor: Colors.canaryYellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
  },
  countdownText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    fontWeight: '700',
  },
  eventTitle: {
    ...Typography.headlineMd,
    color: Colors.inkBlack,
    marginBottom: 2,
  },
  verEventoLink: {
    ...Typography.labelSm,
    color: Colors.electricCobalt,
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  eventDate: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.surfaceDim,
    marginVertical: 12,
  },
  ticketBody: {
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  infoVal: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderColor: Colors.surfaceDim,
  },
  totalLabel: {
    ...Typography.titleMd,
    fontWeight: '700',
    color: Colors.inkBlack,
  },
  totalVal: {
    ...Typography.headlineMd,
    color: Colors.electricCobalt,
    fontWeight: '800',
  },
  reembolsoBox: {
    backgroundColor: Colors.errorContainer,
    borderWidth: 1.5,
    borderColor: Colors.popVermilion,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  reembolsoTitle: {
    ...Typography.labelSm,
    color: Colors.popVermilion,
    marginBottom: 2,
  },
  reembolsoText: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
    fontWeight: '600',
  },
  utilizadaBox: {
    backgroundColor: Colors.surfaceContainer,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    marginTop: 10,
  },
  utilizadaText: {
    ...Typography.bodyMd,
    color: Colors.outline,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionsBlock: {
    marginBottom: 24,
  },
  actionBtnSlot: {
    marginBottom: 12,
  },
  avisoSimulado: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 6,
  },
  timelineBlock: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  timelineHeading: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  backBtnWrapper: {
    alignSelf: 'center',
    marginTop: 16,
  },
});
