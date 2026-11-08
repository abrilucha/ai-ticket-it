import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useEvento } from '../../hooks/useEvento.js';
import { Screen } from '../../components/Screen.js';
import { EventImage } from '../../components/EventImage.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopButton } from '../../components/PopButton.js';
import { RatingStars } from '../../components/RatingStars.js';
import { ReviewCard } from '../../components/ReviewCard.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';
import { formatFechaCompleta, formatPrecio } from '../../utils/formato.js';

export function EventoDetalleScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { data: evento, loading, error, reload } = useEvento(id);

  if (loading) {
    return (
      <Screen>
        <LoadingView message="Cargando información del evento..." />
      </Screen>
    );
  }

  if (error) {
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

  // Verificar si todas las entradas están agotadas
  const tiposEntrada = Array.isArray(evento.tiposEntrada) ? evento.tiposEntrada : [];
  const todasAgotadas = tiposEntrada.length > 0 && tiposEntrada.every(
    (t) => (t.cupoRestante ?? t.cupoDisponible ?? t.cupo) <= 0
  );

  // Configuración del botón de compra según reglas de negocio
  let btnTitle = 'COMPRAR ENTRADAS';
  let btnDisabled = false;

  if (evento.realizado) {
    btnTitle = 'EVENTO REALIZADO';
    btnDisabled = true;
  } else if (todasAgotadas) {
    btnTitle = 'SIN ENTRADAS DISPONIBLES';
    btnDisabled = true;
  }

  const handleComprarPress = () => {
    Alert.alert(
      'FASE 2: DETALLE DE EVENTO',
      'La selección de cantidad y compra de entradas se habilitará en la Fase 3.',
      [{ text: 'ENTENDIDO' }]
    );
  };

  const resenasOrganizador = Array.isArray(evento.organizador?.resenas)
    ? evento.organizador.resenas
    : [];
  const ultimas3Resenas = resenasOrganizador.slice(0, 3);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Barra superior con botón volver */}
        <View style={styles.topNavRow}>
          <HardShadow offset={2} borderRadius={8}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← VOLVER</Text>
            </Pressable>
          </HardShadow>
          <Text style={styles.screenTag}>DETALLE DEL EVENTO</Text>
        </View>

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

        {/* Tipos de Entrada y Cupos */}
        <View style={styles.seccionBloque}>
          <Text style={styles.seccionTitulo}>TIPOS DE ENTRADA Y DISPONIBILIDAD</Text>
          {tiposEntrada.map((tipo) => {
            const cupoRestante = tipo.cupoRestante ?? tipo.cupoDisponible ?? tipo.cupo;
            const esAgotado = cupoRestante <= 0;

            return (
              <HardShadow key={tipo.id} offset={3} borderRadius={10} style={styles.tipoWrapper}>
                <View style={[styles.tipoCard, esAgotado && styles.tipoCardAgotado]}>
                  <View style={styles.tipoHeader}>
                    <Text style={styles.tipoNombre}>{tipo.nombre}</Text>
                    <Text style={styles.tipoPrecio}>{formatPrecio(tipo.precio)}</Text>
                  </View>

                  <View style={styles.cupoRow}>
                    {esAgotado ? (
                      <View style={styles.agotadoPill}>
                        <Text style={styles.agotadoText}>AGOTADO</Text>
                      </View>
                    ) : (
                      <Text style={styles.cupoTexto}>
                        Cupo disponible: <Text style={styles.cupoNumero}>{cupoRestante}</Text> / {tipo.cupo} entradas
                      </Text>
                    )}
                  </View>
                </View>
              </HardShadow>
            );
          })}
        </View>

        {/* Botón de acción Comprar */}
        <View style={styles.actionBlock}>
          <PopButton
            title={btnTitle}
            variant={btnDisabled ? 'secondary' : 'primary'}
            disabled={btnDisabled}
            size="lg"
            onPress={handleComprarPress}
          />
        </View>

        {/* Sección del Organizador y Reseñas previas */}
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

          {/* Reseñas recientes del organizador en todos sus eventos */}
          <Text style={styles.resenasTitulo}>
            OPINIONES SOBRE EL ORGANIZADOR ({resenasOrganizador.length})
          </Text>

          {ultimas3Resenas.length === 0 ? (
            <Text style={styles.sinResenasTexto}>
              Este organizador todavía no posee reseñas registradas en el sistema.
            </Text>
          ) : (
            ultimas3Resenas.map((resena) => (
              <ReviewCard key={resena.id} resena={resena} />
            ))
          )}

          {evento.organizador?.id && (
            <View style={styles.verTodasBtnContainer}>
              <PopButton
                title={`VER TODAS LAS RESEÑAS (${evento.organizador?.cantidadResenas || 0}) →`}
                variant="secondary"
                size="sm"
                onPress={() =>
                  navigation.navigate('OrganizadorPerfil', {
                    organizadorId: evento.organizador.id,
                    organizadorNombre: evento.organizador.nombre,
                  })
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    marginBottom: 10,
  },
  tipoCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 14,
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
  actionBlock: {
    marginVertical: 10,
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
});
