import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useAuth } from '../../context/AuthContext.js';
import { useCompra } from '../../hooks/useCompra.js';
import { useUtilizarCompra } from '../../hooks/useUtilizarCompra.js';
import { useResenaDeCompra } from '../../hooks/useResenaDeCompra.js';
import { pagarCompra, cancelarCompra } from '../../api/compras.js';
import { crearResena } from '../../api/resenas.js';
import { armarPayloadQR } from '../../utils/qr.js';
import { Screen } from '../../components/Screen.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopButton } from '../../components/PopButton.js';
import { StateBadge } from '../../components/StateBadge.js';
import { StatusTimeline } from '../../components/StatusTimeline.js';
import { RatingStars } from '../../components/RatingStars.js';
import { RatingInput } from '../../components/RatingInput.js';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';
import { formatFechaCompleta, formatPrecio } from '../../utils/formato.js';
import { useFeedback } from '../../context/FeedbackContext.js';

export function CompraDetalleScreen({ route, navigation }) {
  const { id, origen } = route.params || {};
  const { usuario } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useFeedback();
  const { data: compra, loading, error, reload } = useCompra(id);
  const { resena, reload: reloadResena } = useResenaDeCompra(id);

  // Recargar al recibir foco
  useFocusEffect(
    useCallback(() => {
      reload();
      reloadResena();
    }, [reload, reloadResena])
  );

  // Estados de operaciones de pago, cancelación y QR
  const [pagando, setPagando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [utilizarModalVisible, setUtilizarModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [accionError, setAccionError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([reload(), reloadResena()]);
    setRefreshing(false);
  };

  // Estados de reseña
  const [resenaModalVisible, setResenaModalVisible] = useState(false);
  const [resenaPuntaje, setResenaPuntaje] = useState(5);
  const [resenaComentario, setResenaComentario] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [resenaError, setResenaError] = useState(null);

  // Hook para utilización por parte del organizador
  const { loading: utilizando, marcarUtilizada } = useUtilizarCompra();

  // Abrir chat
  const handleAbrirChat = () => {
    if (!compra?.id) return;
    navigation.navigate('ChatCompra', {
      compraId: compra.id,
      compra,
    });
  };

  // Enviar reseña
  const handleEnviarResena = async () => {
    if (enviandoResena || !compra?.puedeResenar) return;

    const comentarioLimpio = resenaComentario.trim();
    if (!resenaPuntaje || resenaPuntaje < 1 || resenaPuntaje > 5) {
      setResenaError('Elegí un puntaje de 1 a 5 estrellas.');
      return;
    }
    if (!comentarioLimpio) {
      setResenaError('Escribí un comentario contando tu experiencia.');
      return;
    }
    if (comentarioLimpio.length > 500) {
      setResenaError('El comentario no puede superar los 500 caracteres.');
      return;
    }

    setEnviandoResena(true);
    setResenaError(null);
    showLoading('Publicando tu reseña...');

    try {
      await crearResena(compra.id, {
        puntaje: resenaPuntaje,
        comentario: comentarioLimpio,
      });
      setResenaModalVisible(false);
      setResenaComentario('');
      await reload();
      await reloadResena();
      hideLoading();
      showSuccess('¡Reseña publicada con éxito!');
    } catch (err) {
      hideLoading();
      setResenaError(err.message || 'Error al enviar la reseña.');
    } finally {
      setEnviandoResena(false);
    }
  };

  // Acción Pagar (simulado) con protección contra doble toque
  const handlePagar = async () => {
    if (pagando || !compra || !compra.puedePagar) return;
    setPagando(true);
    setAccionError(null);
    showLoading('Confirmando pago...');

    try {
      await pagarCompra(compra.id);
      await reload();
      hideLoading();
      showSuccess('¡Pago confirmado con éxito!');
    } catch (err) {
      hideLoading();
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
    showLoading('Cancelando compra...');

    try {
      await cancelarCompra(compra.id);
      setCancelModalVisible(false);
      await reload();
      hideLoading();
      showSuccess('¡Compra cancelada exitosamente!');
    } catch (err) {
      hideLoading();
      setAccionError(err.message || 'Error al procesar la cancelación.');
      reload();
    } finally {
      setCancelando(false);
    }
  };

  // Acción Marcar como Utilizada (Organizador)
  const handleConfirmarUtilizar = async () => {
    if (utilizando || !compra || !compra.puedeUtilizar) return;
    setAccionError(null);
    showLoading('Validando entrada...');

    try {
      await marcarUtilizada(compra.id);
      setUtilizarModalVisible(false);
      await reload();
      hideLoading();
      showSuccess('¡Entrada validada exitosamente!');
    } catch (err) {
      hideLoading();
      setAccionError(err.message || 'Error al canjear la entrada.');
      reload();
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
  const compradorNombre = compra.comprador?.nombre
    ? `${compra.comprador.nombre} ${compra.comprador.apellido || ''}`.trim()
    : null;

  const esComprador = usuario?.rol !== 'ORGANIZADOR';
  const ultimoHistorial = Array.isArray(compra.historialEstados) && compra.historialEstados.length > 0
    ? compra.historialEstados[compra.historialEstados.length - 1]
    : null;

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

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.electricCobalt]}
          />
        }
      >
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
              {compradorNombre && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>ASISTENTE / COMPRADOR:</Text>
                  <Text style={styles.infoVal}>👤 {compradorNombre}</Text>
                </View>
              )}

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

            {/* Sección de QR / Estado de Acceso exclusiva para el Comprador */}
            {esComprador && (
              <View style={styles.qrSectionWrapper}>
                <View style={styles.divider} />

                {compra.estado === 'CONFIRMADA' && (
                  <View style={styles.qrBlock}>
                    <Text style={styles.qrHeaderTitle}>CÓDIGO DE ACCESO</Text>
                    <Text style={styles.qrHeaderSub}>Presentá este código QR en el acceso al evento</Text>

                    <HardShadow offset={3} borderRadius={12} style={styles.qrCardShadow}>
                      <View style={styles.qrBox}>
                        <QRCode
                          value={armarPayloadQR(compra.id)}
                          size={180}
                          color={Colors.inkBlack}
                          backgroundColor={Colors.white}
                        />
                      </View>
                    </HardShadow>

                    <PopButton
                      title="🔍 VER QR GRANDE"
                      variant="secondary"
                      size="sm"
                      onPress={() => setQrModalVisible(true)}
                      style={styles.btnQrGrande}
                    />
                  </View>
                )}

                {compra.estado === 'UTILIZADA' && (
                  <View style={styles.qrBlock}>
                    <HardShadow offset={4} borderRadius={12} style={styles.selloCardShadow}>
                      <View style={styles.selloUtilizada}>
                        <View style={styles.selloBadge}>
                          <Text style={styles.selloBadgeText}>✓ CANJEADO EN PUERTA</Text>
                        </View>
                        <Text style={styles.selloTitle}>ENTRADA UTILIZADA</Text>
                        <Text style={styles.selloDesc}>
                          Esta entrada ya fue validada en el acceso y su código QR quedó consumido.
                        </Text>
                        {ultimoHistorial && (
                          <Text style={styles.selloFecha}>
                            Fecha de ingreso: {formatFechaCompleta(ultimoHistorial.fecha)}
                          </Text>
                        )}
                      </View>
                    </HardShadow>
                  </View>
                )}

                {compra.estado === 'PENDIENTE' && (
                  <View style={styles.qrBlock}>
                    <HardShadow offset={3} borderRadius={12} style={styles.qrPlaceholderShadow}>
                      <View style={styles.qrPlaceholderBox}>
                        <Text style={styles.placeholderEmoji}>🔒</Text>
                        <Text style={styles.placeholderTitle}>QR BLOQUEADO</Text>
                        <Text style={styles.placeholderText}>
                          El QR se habilita cuando pagues tu entrada.
                        </Text>
                      </View>
                    </HardShadow>
                  </View>
                )}

                {(compra.estado === 'CANCELADA' || compra.estado === 'REEMBOLSADA') && (
                  <View style={styles.qrBlock}>
                    <HardShadow offset={3} borderRadius={12} style={styles.qrPlaceholderShadow}>
                      <View style={[styles.qrPlaceholderBox, styles.qrInvalidoBox]}>
                        <Text style={styles.placeholderEmoji}>🚫</Text>
                        <Text style={[styles.placeholderTitle, styles.qrInvalidoTitle]}>ENTRADA NO VÁLIDA</Text>
                        <Text style={styles.placeholderText}>
                          Esta compra se encuentra {compra.estado.toLowerCase()} y ya no da derecho de acceso.
                        </Text>
                      </View>
                    </HardShadow>
                  </View>
                )}
              </View>
            )}
          </View>
        </HardShadow>

        {/* Acciones principales: Pagar, Cancelar, Chat y Calificar */}
        <View style={styles.actionsBlock}>
          {/* Botón CHAT disponible en cualquier estado de la compra */}
          <View style={styles.actionBtnSlot}>
            <PopButton
              title={esComprador ? '💬 CHAT CON EL ORGANIZADOR' : '💬 CHAT CON EL COMPRADOR'}
              variant="secondary"
              size="md"
              onPress={handleAbrirChat}
            />
          </View>

          {/* Botón MARCAR COMO UTILIZADA si puedeUtilizar es true */}
          {compra.puedeUtilizar ? (
            <View style={styles.actionBtnSlot}>
              <PopButton
                title="✓ MARCAR COMO UTILIZADA"
                variant="canary"
                size="lg"
                loading={utilizando}
                disabled={utilizando}
                onPress={() => setUtilizarModalVisible(true)}
              />
            </View>
          ) : null}

          {/* Botón CALIFICAR EVENTO si puedeResenar es true */}
          {compra.puedeResenar ? (
            <View style={styles.actionBtnSlot}>
              <PopButton
                title="⭐ CALIFICAR EVENTO"
                variant="canary"
                size="lg"
                onPress={() => {
                  setResenaError(null);
                  setResenaModalVisible(true);
                }}
              />
            </View>
          ) : null}

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

        {/* Sección Tu Reseña si la compra ya fue reseñada */}
        {compra.resenada && (
          <View style={styles.resenaBlock}>
            <HardShadow offset={4} borderRadius={12} style={styles.resenaCardShadow}>
              <View style={styles.resenaCard}>
                <View style={styles.resenaHeaderRow}>
                  <Text style={styles.resenaHeaderTitle}>TU RESEÑA DEL EVENTO</Text>
                  <View style={styles.resenaBadge}>
                    <Text style={styles.resenaBadgeText}>✓ PUBLICADA</Text>
                  </View>
                </View>

                {resena ? (
                  <View style={styles.resenaContent}>
                    <View style={styles.resenaScoreRow}>
                      <RatingStars puntaje={resena.puntaje} showCount={false} size="md" />
                      {resena.fecha ? (
                        <Text style={styles.resenaDateText}>
                          {formatFechaCompleta(resena.fecha)}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.resenaComentarioText}>"{resena.comentario}"</Text>
                    <Text style={styles.resenaAgradecimiento}>
                      ¡Gracias por compartir tu opinión! Ayuda a otros compradores y a la reputación del organizador.
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.resenaCargando}>Cargando tu reseña...</Text>
                )}
              </View>
            </HardShadow>
          </View>
        )}

        {/* Historial de estados (Línea de tiempo) */}
        <View style={styles.timelineBlock}>
          <Text style={styles.timelineHeading}>HISTORIAL DE ESTADOS</Text>
          <StatusTimeline historial={compra.historialEstados} />
        </View>
      </ScrollView>

      {/* Modal de confirmación de Utilización (Organizador) */}
      <ConfirmModal
        visible={utilizarModalVisible}
        title="¿MARCAR COMO UTILIZADA?"
        message="Esta acción registrará el ingreso del asistente y liberará la validación. La entrada ya no podrá volver a utilizarse ni cancelarse."
        confirmText="SÍ, MARCAR UTILIZADA"
        cancelText="NO, CANCELAR"
        variant="primary"
        loading={utilizando}
        onConfirm={handleConfirmarUtilizar}
        onCancel={() => setUtilizarModalVisible(false)}
      />

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

      {/* Modal de QR Grande a Pantalla Completa para Escaneo Fácil */}
      <Modal
        visible={qrModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <HardShadow offset={6} borderRadius={16} style={styles.modalQrCardShadow}>
            <View style={styles.modalQrCard}>
              <View style={styles.modalQrHeader}>
                <Text style={styles.modalQrTitle}>{eventoNombre}</Text>
                <Text style={styles.modalQrSub}>{tipoNombre} · {cantidad} {cantidad === 1 ? 'entrada' : 'entradas'}</Text>
              </View>

              <View style={styles.modalQrBox}>
                {compra?.id ? (
                  <QRCode
                    value={armarPayloadQR(compra.id)}
                    size={260}
                    color={Colors.inkBlack}
                    backgroundColor={Colors.white}
                  />
                ) : null}
              </View>

              <Text style={styles.modalQrHint}>Aumentá el brillo del celular para facilitar el escaneo en el acceso</Text>

              <PopButton
                title="CERRAR"
                variant="primary"
                size="md"
                onPress={() => setQrModalVisible(false)}
                style={styles.modalCerrarBtn}
              />
            </View>
          </HardShadow>
        </View>
      </Modal>

      {/* Modal de Calificar Evento */}
      <Modal
        visible={resenaModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !enviandoResena && setResenaModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <HardShadow offset={6} borderRadius={16} style={styles.modalReviewCardShadow}>
            <View style={styles.modalReviewCard}>
              <View style={styles.modalReviewHeader}>
                <Text style={styles.modalReviewTitle}>CALIFICAR EVENTO</Text>
                <Text style={styles.modalReviewSubtitle} numberOfLines={1}>
                  {eventoNombre}
                </Text>
              </View>

              {resenaError && (
                <View style={styles.reviewErrorWrapper}>
                  <ErrorBanner message={resenaError} onRetry={() => setResenaError(null)} />
                </View>
              )}

              <Text style={styles.inputSectionLabel}>TU PUNTUACIÓN</Text>
              <RatingInput
                value={resenaPuntaje}
                onChange={setResenaPuntaje}
                disabled={enviandoResena}
              />

              <View style={styles.comentarioHeaderRow}>
                <Text style={styles.inputSectionLabel}>TU OPINIÓN</Text>
                <Text
                  style={[
                    styles.commentCounter,
                    500 - resenaComentario.length < 50 && styles.commentCounterWarn,
                  ]}
                >
                  {resenaComentario.length}/500
                </Text>
              </View>

              <TextInput
                style={styles.commentInput}
                placeholder="Contanos qué te pareció la organización, la puntualidad, el sonido..."
                placeholderTextColor={Colors.outline}
                value={resenaComentario}
                onChangeText={setResenaComentario}
                multiline
                maxLength={500}
                editable={!enviandoResena}
              />

              <View style={styles.reviewModalActions}>
                <PopButton
                  title="PUBLICAR RESEÑA"
                  variant="canary"
                  size="md"
                  loading={enviandoResena}
                  disabled={enviandoResena || !resenaComentario.trim()}
                  onPress={handleEnviarResena}
                  style={styles.reviewModalBtn}
                />
                <PopButton
                  title="CANCELAR"
                  variant="secondary"
                  size="sm"
                  disabled={enviandoResena}
                  onPress={() => setResenaModalVisible(false)}
                  style={styles.reviewModalBtn}
                />
              </View>
            </View>
          </HardShadow>
        </KeyboardAvoidingView>
      </Modal>
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
  qrSectionWrapper: {
    marginTop: 4,
  },
  qrBlock: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  qrHeaderTitle: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    marginBottom: 4,
    textAlign: 'center',
  },
  qrHeaderSub: {
    ...Typography.bodySm,
    color: '#666666',
    marginBottom: 14,
    textAlign: 'center',
  },
  qrCardShadow: {
    marginBottom: 10,
  },
  qrBox: {
    backgroundColor: Colors.white,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnQrGrande: {
    marginTop: 4,
  },
  selloCardShadow: {
    width: '100%',
  },
  selloUtilizada: {
    backgroundColor: '#FFF4E5',
    borderWidth: 2.5,
    borderColor: Colors.popVermilion,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  selloBadge: {
    backgroundColor: Colors.popVermilion,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  selloBadgeText: {
    ...Typography.labelSm,
    color: Colors.white,
    fontWeight: '900',
  },
  selloTitle: {
    ...Typography.headlineSm,
    color: Colors.inkBlack,
    marginBottom: 6,
  },
  selloDesc: {
    ...Typography.bodySm,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 6,
  },
  selloFecha: {
    ...Typography.bodySm,
    fontWeight: '700',
    color: Colors.inkBlack,
  },
  qrPlaceholderShadow: {
    width: '100%',
  },
  qrPlaceholderBox: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: Colors.outline,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderTitle: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
    marginBottom: 4,
  },
  placeholderText: {
    ...Typography.bodySm,
    color: '#666666',
    textAlign: 'center',
  },
  qrInvalidoBox: {
    borderColor: Colors.popVermilion,
    backgroundColor: '#FFF5F5',
  },
  qrInvalidoTitle: {
    color: Colors.popVermilion,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalQrCardShadow: {
    width: '100%',
    maxWidth: 360,
  },
  modalQrCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 3,
    borderColor: Colors.inkBlack,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalQrHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalQrTitle: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    textAlign: 'center',
  },
  modalQrSub: {
    ...Typography.bodySm,
    color: Colors.electricCobalt,
    fontWeight: '700',
    marginTop: 2,
  },
  modalQrBox: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalQrHint: {
    ...Typography.bodySm,
    color: '#666666',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 8,
  },
  modalCerrarBtn: {
    width: '100%',
    marginTop: 10,
  },
  resenaBlock: {
    marginBottom: 20,
  },
  resenaCardShadow: {
    width: '100%',
  },
  resenaCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 16,
  },
  resenaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resenaHeaderTitle: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
    fontWeight: '800',
  },
  resenaBadge: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  resenaBadgeText: {
    ...Typography.labelSm,
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  resenaContent: {
    gap: 8,
  },
  resenaScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  resenaDateText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  resenaComentarioText: {
    ...Typography.bodyMd,
    fontStyle: 'italic',
    color: Colors.inkBlack,
    lineHeight: 20,
    marginTop: 4,
  },
  resenaAgradecimiento: {
    ...Typography.bodySm,
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
  },
  resenaCargando: {
    ...Typography.bodyMd,
    color: Colors.outline,
    fontStyle: 'italic',
  },
  modalReviewCardShadow: {
    width: '100%',
    maxWidth: 380,
  },
  modalReviewCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 3,
    borderColor: Colors.inkBlack,
    borderRadius: 16,
    padding: 18,
  },
  modalReviewHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalReviewTitle: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    fontWeight: '900',
  },
  modalReviewSubtitle: {
    ...Typography.bodySm,
    color: Colors.electricCobalt,
    fontWeight: '700',
    marginTop: 2,
  },
  reviewErrorWrapper: {
    marginBottom: 10,
  },
  inputSectionLabel: {
    ...Typography.labelSm,
    fontSize: 11,
    color: Colors.inkBlack,
    fontWeight: '800',
    marginBottom: 4,
  },
  comentarioHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  commentCounter: {
    ...Typography.labelSm,
    fontSize: 11,
    color: Colors.outline,
  },
  commentCounterWarn: {
    color: Colors.popVermilion,
    fontWeight: '700',
  },
  commentInput: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 12,
    minHeight: 110,
    maxHeight: 160,
    ...Typography.bodyMd,
    color: Colors.inkBlack,
    textAlignVertical: 'top',
  },
  reviewModalActions: {
    marginTop: 14,
    gap: 8,
  },
  reviewModalBtn: {
    width: '100%',
  },
});
