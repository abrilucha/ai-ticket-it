import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useEvento } from '../../hooks/useEvento.js';
import { crearCompra } from '../../api/compras.js';
import { Screen } from '../../components/Screen.js';
import { EventImage } from '../../components/EventImage.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopButton } from '../../components/PopButton.js';
import { RatingStars } from '../../components/RatingStars.js';
import { ReviewCard } from '../../components/ReviewCard.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';
import { QuantityStepper } from '../../components/QuantityStepper.js';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { FavoriteButton } from '../../components/FavoriteButton.js';
import { formatFechaCompleta, formatPrecio } from '../../utils/formato.js';

export function EventoDetalleScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { data: evento, loading, error, reload } = useEvento(id);

  // Recargar datos al recibir foco para mantener el cupo actualizado
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // Selección de tipo de entrada y cantidad
  const [selectedTipoId, setSelectedTipoId] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  // Modal de confirmación y estados de compra
  const [modalVisible, setModalVisible] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [compraError, setCompraError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const tiposEntrada = Array.isArray(evento?.tiposEntrada) ? evento.tiposEntrada : [];

  // Seleccionar automáticamente el primer tipo disponible si no hay seleccionado
  const tipoSeleccionado = tiposEntrada.find((t) => t.id === selectedTipoId) ||
    tiposEntrada.find((t) => (t.cupoRestante ?? t.cupoDisponible ?? t.cupo) > 0) ||
    tiposEntrada[0];

  const cupoMaximo = tipoSeleccionado
    ? (tipoSeleccionado.cupoRestante ?? tipoSeleccionado.cupoDisponible ?? tipoSeleccionado.cupo)
    : 0;

  const totalEstimado = tipoSeleccionado ? tipoSeleccionado.precio * cantidad : 0;

  const todasAgotadas = tiposEntrada.length > 0 && tiposEntrada.every(
    (t) => (t.cupoRestante ?? t.cupoDisponible ?? t.cupo) <= 0
  );

  // Acción de compra con protección de doble toque
  const handleConfirmarCompra = async () => {
    if (comprando || !evento || !tipoSeleccionado) return;
    setComprando(true);
    setCompraError(null);

    try {
      const nuevaCompra = await crearCompra({
        eventoId: evento.id,
        tipoEntradaId: tipoSeleccionado.id,
        cantidad,
      });

      setModalVisible(false);
      // Navegamos al detalle de la compra recién creada reemplazando la vista para evitar estados viejos
      navigation.replace('CompraDetalle', {
        id: nuevaCompra.id,
        origen: 'compra_nueva',
      });
    } catch (err) {
      setCompraError(err.message || 'Error al procesar la compra.');
      // Refrescar el detalle del evento para actualizar cupos
      reload();
    } finally {
      setComprando(false);
    }
  };

  if (loading && !evento) {
    return (
      <Screen>
        <LoadingView message="Cargando información del evento..." />
      </Screen>
    );
  }

  if (error && !evento) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <ErrorBanner message={error} onRetry={reload} />
          <PopButton
            title="← VOLVER AL CATÁLOGO"
            variant="secondary"
            size="sm"
            onPress={() => navigation.goBack()}
            style={styles.backBtnWrapper}
          />
        </View>
      </Screen>
    );
  }

  if (!evento) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <EmptyState
            icon="🎟️"
            title="EVENTO NO ENCONTRADO"
            subtitle="El evento solicitado no existe o fue eliminado del sistema."
            action={
              <PopButton
                title="← VOLVER AL CATÁLOGO"
                variant="primary"
                size="sm"
                onPress={() => navigation.goBack()}
              />
            }
          />
        </View>
      </Screen>
    );
  }

  const imagenUri = Array.isArray(evento.multimedia) && evento.multimedia.length > 0
    ? evento.multimedia[0]
    : null;

  const categoriaCodigo = evento.categoria?.codigo || '';
  const categoriaNombre = evento.categoria?.nombre || 'General';

  // Configuración del botón de compra
  let btnTitle = 'INICIAR COMPRA';
  let btnDisabled = false;

  if (evento.realizado) {
    btnTitle = 'EVENTO REALIZADO';
    btnDisabled = true;
  } else if (todasAgotadas) {
    btnTitle = 'SIN ENTRADAS DISPONIBLES';
    btnDisabled = true;
  } else if (!tipoSeleccionado || cupoMaximo <= 0) {
    btnTitle = 'TIPO SELECCIONADO AGOTADO';
    btnDisabled = true;
  }

  const resenasOrganizador = Array.isArray(evento.organizador?.resenas)
    ? evento.organizador.resenas
    : [];
  const ultimas3ResenasOrganizador = resenasOrganizador.slice(0, 3);

  return (
    <Screen>
      {/* Barra superior fija con botón volver en rojo y botón de favoritos */}
      <View style={styles.topFixedBar}>
        <HardShadow offset={2} borderRadius={8}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backButtonText}>← VOLVER</Text>
          </Pressable>
        </HardShadow>

        {evento?.id ? (
          <FavoriteButton
            eventoId={evento.id}
            esFavoritoInicial={Boolean(evento.esFavorito)}
          />
        ) : null}
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
        {/* Banner de error de compra si ocurrió */}
        {compraError ? (
          <ErrorBanner message={compraError} onRetry={() => setCompraError(null)} />
        ) : null}

        {/* Imagen de portada */}
        <HardShadow offset={4} borderRadius={12} style={styles.imageWrapper}>
          <View style={styles.imageCard}>
            <EventImage
              uri={imagenUri}
              categoriaCodigo={categoriaCodigo}
              height={220}
            />
            {evento.realizado && (
              <View style={styles.realizadoBadge}>
                <Text style={styles.realizadoBadgeText}>EVENTO REALIZADO</Text>
              </View>
            )}
          </View>
        </HardShadow>

        {/* Ficha principal */}
        <View style={styles.infoCard}>
          <View style={styles.catRow}>
            <View style={styles.categoriaPill}>
              <Text style={styles.categoriaPillText}>{categoriaNombre}</Text>
            </View>
          </View>

          <Text style={styles.titulo}>{evento.nombre}</Text>

          <View style={styles.fechaBox}>
            <Text style={styles.fechaIcon}>🗓️</Text>
            <Text style={styles.fechaTexto}>{formatFechaCompleta(evento.fecha)}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>ACERCA DE ESTE EVENTO</Text>
          <Text style={styles.descripcion}>{evento.descripcion || 'Sin descripción detallada.'}</Text>
        </View>

        {/* Tarjeta de Categoría y Descripción no hardcodeada */}
        <HardShadow offset={3} borderRadius={10} style={styles.catCardShadow}>
          <View style={styles.catCard}>
            <View style={styles.catHeaderPill}>
              <Text style={styles.catHeaderPillText}>
                CATEGORÍA: {(evento.categoria?.nombre || evento.categoria?.codigo || (typeof evento.categoria === 'string' ? evento.categoria : 'General')).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.catCardDesc}>
              {evento.categoria?.descripcion || 'Eventos y espectáculos de esta categoría.'}
            </Text>
          </View>
        </HardShadow>

        {/* Tipos de Entrada y Selector de Cantidad */}
        <View style={styles.seccionBloque}>
          <Text style={styles.seccionTitulo}>SELECCIONÁ TU ENTRADA Y CANTIDAD</Text>
          {tiposEntrada.map((tipo) => {
            const cupoRestante = tipo.cupoRestante ?? tipo.cupoDisponible ?? tipo.cupo;
            const esAgotado = cupoRestante <= 0;
            const isSelected = (tipoSeleccionado?.id === tipo.id) && !esAgotado;

            return (
              <HardShadow key={tipo.id} offset={isSelected ? 1 : 3} borderRadius={10} style={styles.tipoWrapper}>
                <Pressable
                  disabled={esAgotado}
                  onPress={() => {
                    setSelectedTipoId(tipo.id);
                    setCantidad(1); // Reiniciar a 1 al cambiar de tipo
                  }}
                  style={[
                    styles.tipoCard,
                    isSelected && styles.tipoCardSelected,
                    esAgotado && styles.tipoCardAgotado,
                  ]}
                >
                  <View style={styles.tipoHeader}>
                    <View style={styles.tipoNombreRow}>
                      <Text style={styles.radioIndicator}>{isSelected ? '●' : '○'}</Text>
                      <Text style={styles.tipoNombre}>{tipo.nombre}</Text>
                    </View>
                    <Text style={styles.tipoPrecio}>{formatPrecio(tipo.precio)}</Text>
                  </View>

                  <View style={styles.cupoRow}>
                    {esAgotado ? (
                      <View style={styles.agotadoPill}>
                        <Text style={styles.agotadoText}>AGOTADO</Text>
                      </View>
                    ) : (
                      <Text style={styles.cupoTexto}>
                        Disponibles: <Text style={styles.cupoNumero}>{cupoRestante}</Text> / {tipo.cupo}
                      </Text>
                    )}
                  </View>

                  {/* Selector de Cantidad si este tipo está seleccionado */}
                  {isSelected && (
                    <View style={styles.stepperContainer}>
                      <Text style={styles.stepperLabel}>CANTIDAD:</Text>
                      <QuantityStepper
                        value={cantidad}
                        min={1}
                        max={cupoRestante}
                        onChange={(nuevaCant) => setCantidad(nuevaCant)}
                      />
                    </View>
                  )}
                </Pressable>
              </HardShadow>
            );
          })}
        </View>

        {/* Resumen del Total Estimado y Botón de Compra */}
        {!evento.realizado && !todasAgotadas && tipoSeleccionado && cupoMaximo > 0 && (
          <HardShadow offset={3} borderRadius={10} style={styles.resumenWrapper}>
            <View style={styles.resumenCard}>
              <View style={styles.resumenTextCol}>
                <Text style={styles.resumenTipo}>
                  {cantidad}x {tipoSeleccionado.nombre}
                </Text>
                <Text style={styles.resumenAviso}>Total estimado (definido por el back):</Text>
              </View>
              <Text style={styles.resumenTotal}>{formatPrecio(totalEstimado)}</Text>
            </View>
          </HardShadow>
        )}

        {/* Botón de acción Comprar */}
        <View style={styles.actionBlock}>
          <PopButton
            title={btnTitle}
            variant={btnDisabled ? 'secondary' : 'primary'}
            disabled={btnDisabled}
            size="lg"
            onPress={() => setModalVisible(true)}
          />
        </View>

        {/* Sección del Organizador y Reseñas */}
        <View style={styles.seccionBloque}>
          <View style={styles.organizadorHeaderRow}>
            <View style={styles.organizadorInfoCol}>
              <Text style={styles.organizadorSub}>ORGANIZADO POR</Text>
              <Text style={styles.organizadorNombre}>
                {evento.organizador?.nombre || 'Organizador verificado'}
              </Text>
              <RatingStars
                puntaje={evento.organizador?.puntajePromedio}
                cantidad={evento.organizador?.cantidadResenas}
                size="md"
                style={styles.orgRating}
              />
            </View>
          </View>

          <Text style={styles.resenasTitulo}>
            OPINIONES SOBRE EL ORGANIZADOR ({resenasOrganizador.length})
          </Text>

          {ultimas3ResenasOrganizador.length === 0 ? (
            <Text style={styles.sinResenasTexto}>
              Este organizador todavía no posee opiniones registradas.
            </Text>
          ) : (
            ultimas3ResenasOrganizador.map((resena) => (
              <ReviewCard
                key={resena.id}
                resena={resena}
                onPressEvento={(targetEventoId) => {
                  if (targetEventoId && targetEventoId !== id) {
                    navigation.push('EventoDetalle', { eventoId: targetEventoId });
                  }
                }}
              />
            ))
          )}

          {resenasOrganizador.length > 0 && (
            <View style={styles.verTodasBtnContainer}>
              <HardShadow offset={3} borderRadius={8}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('EventoResenas', {
                      organizadorNombre: evento.organizador?.nombre || 'Organizador',
                      resenas: resenasOrganizador,
                      puntaje: evento.organizador?.puntajePromedio,
                      cantidadResenas: evento.organizador?.cantidadResenas || resenasOrganizador.length,
                    })
                  }
                  style={styles.verTodasBtnAmarillo}
                >
                  <Text style={styles.verTodasBtnAmarilloText}>
                    VER TODAS LAS RESEÑAS ({resenasOrganizador.length}) →
                  </Text>
                </Pressable>
              </HardShadow>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Pop Art de Confirmación de Compra */}
      <ConfirmModal
        visible={modalVisible}
        title="CONFIRMAR COMPRA"
        message={`¿Querés reservar ${cantidad} ${cantidad === 1 ? 'entrada' : 'entradas'} '${tipoSeleccionado?.nombre}' para ${evento.nombre}?`}
        confirmText="CONFIRMAR Y RESERVAR"
        cancelText="CANCELAR"
        variant="primary"
        loading={comprando}
        onConfirm={handleConfirmarCompra}
        onCancel={() => setModalVisible(false)}
      >
        <View style={styles.modalResumenBox}>
          <Text style={styles.modalResumenLabel}>TOTAL A PAGAR (ESTIMADO):</Text>
          <Text style={styles.modalResumenTotal}>{formatPrecio(totalEstimado)}</Text>
          <Text style={styles.modalAvisoReserva}>
            Se generará una compra en estado PENDIENTE con cupo reservado.
          </Text>
        </View>
      </ConfirmModal>
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
    backgroundColor: Colors.vibrantTurquoise,
    borderBottomWidth: 2,
    borderColor: Colors.inkBlack,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: Colors.popVermilion, // Botón volver en rojo Pop Art
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    ...Typography.labelMd,
    color: Colors.white,
    fontWeight: '900',
  },
  catCardShadow: {
    marginBottom: 16,
  },
  catCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 14,
  },
  catHeaderPill: {
    backgroundColor: Colors.canaryYellow,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    marginBottom: 8,
  },
  catHeaderPillText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    fontWeight: '900',
  },
  catCardDesc: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
    lineHeight: 20,
  },
  verTodasBtnAmarillo: {
    backgroundColor: Colors.canaryYellow, // Cartelito en amarillo
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verTodasBtnAmarilloText: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    fontWeight: '900',
  },
  imageWrapper: {
    marginBottom: 16,
  },
  imageCard: {
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  realizadoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.popVermilion,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    transform: [{ rotate: '4deg' }],
  },
  realizadoBadgeText: {
    ...Typography.labelSm,
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  catRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoriaPill: {
    backgroundColor: Colors.canaryYellow,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
  },
  categoriaPillText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
  },
  titulo: {
    ...Typography.headlineLg,
    color: Colors.inkBlack,
    marginBottom: 10,
  },
  fechaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fechaIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fechaTexto: {
    ...Typography.titleMd,
    color: Colors.electricCobalt,
    flex: 1,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.surfaceDim,
    marginVertical: 12,
  },
  sectionLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
    marginBottom: 6,
  },
  descripcion: {
    ...Typography.bodyLg,
    color: Colors.inkBlack,
    lineHeight: 22,
  },
  seccionBloque: {
    marginBottom: 20,
  },
  seccionTitulo: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    marginBottom: 10,
  },
  tipoWrapper: {
    marginBottom: 12,
  },
  tipoCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 14,
  },
  tipoCardSelected: {
    backgroundColor: Colors.canvasTint,
    borderColor: Colors.electricCobalt,
    borderWidth: 2.5,
  },
  tipoCardAgotado: {
    backgroundColor: Colors.surfaceContainer,
  },
  tipoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipoNombreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioIndicator: {
    fontSize: 18,
    color: Colors.electricCobalt,
    marginRight: 8,
  },
  tipoNombre: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
  },
  tipoPrecio: {
    ...Typography.headlineMd,
    color: Colors.electricCobalt,
  },
  cupoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cupoTexto: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  cupoNumero: {
    fontWeight: '700',
    color: Colors.inkBlack,
  },
  agotadoPill: {
    backgroundColor: Colors.errorContainer,
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  agotadoText: {
    ...Typography.labelSm,
    color: Colors.error,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderColor: Colors.surfaceDim,
  },
  stepperLabel: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
  },
  resumenWrapper: {
    marginBottom: 16,
  },
  resumenCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.canaryLight,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 14,
  },
  resumenTextCol: {
    flex: 1,
  },
  resumenTipo: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
  },
  resumenAviso: {
    ...Typography.bodyMd,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  resumenTotal: {
    ...Typography.headlineMd,
    color: Colors.inkBlack,
    fontWeight: '800',
  },
  actionBlock: {
    marginBottom: 24,
  },
  organizadorHeaderRow: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  organizadorInfoCol: {
    width: '100%',
  },
  organizadorSub: {
    ...Typography.labelSm,
    color: Colors.outline,
    marginBottom: 2,
  },
  organizadorNombre: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    marginBottom: 4,
  },
  orgRating: {
    marginTop: 2,
  },
  resenasTitulo: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
    marginBottom: 10,
  },
  sinResenasTexto: {
    ...Typography.bodyMd,
    color: Colors.outline,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  verTodasBtnContainer: {
    marginTop: 8,
    alignSelf: 'flex-start',
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
  modalResumenBox: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
  },
  modalResumenLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
    marginBottom: 2,
  },
  modalResumenTotal: {
    ...Typography.headlineMd,
    color: Colors.electricCobalt,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalAvisoReserva: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
});
