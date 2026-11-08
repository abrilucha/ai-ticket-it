import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { Screen } from '../../components/Screen.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopButton } from '../../components/PopButton.js';
import { FilterChip } from '../../components/FilterChip.js';
import { AvailabilityBar } from '../../components/AvailabilityBar.js';
import { CompraRowOrganizador } from '../../components/CompraRowOrganizador.js';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';
import { useComprasDeEvento } from '../../hooks/useComprasDeEvento.js';
import { useUtilizarCompra } from '../../hooks/useUtilizarCompra.js';
import { obtenerEvento } from '../../api/eventos.js';
import { formatFecha } from '../../utils/formato.js';

const ESTADOS_FILTRO = [
  'TODAS',
  'PENDIENTE',
  'CONFIRMADA',
  'UTILIZADA',
  'CANCELADA',
  'REEMBOLSADA',
];

export function VentasEventoScreen({ route, navigation }) {
  const { id: eventoId } = route.params || {};

  const [evento, setEvento] = useState(null);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const { compras, disponibilidadPorTipo, loading, error, reload } = useComprasDeEvento(eventoId);
  const { loading: utilizando, marcarUtilizada } = useUtilizarCompra();

  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [refreshing, setRefreshing] = useState(false);
  const [compraAUtilizar, setCompraAUtilizar] = useState(null);
  const [utilizarModalVisible, setUtilizarModalVisible] = useState(false);
  const [accionError, setAccionError] = useState(null);

  // Carga del evento cabecera
  const cargarEvento = useCallback(async () => {
    if (!eventoId) return;
    try {
      const data = await obtenerEvento(eventoId);
      setEvento(data);
    } catch {
      // Ignorar fallback si falla cabecera accesoria
    } finally {
      setLoadingEvento(false);
    }
  }, [eventoId]);

  useFocusEffect(
    useCallback(() => {
      cargarEvento();
      reload();
    }, [cargarEvento, reload])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([cargarEvento(), reload()]);
    setRefreshing(false);
  };

  // Filtrado visual de compras
  const comprasFiltradas = compras.filter((c) => {
    if (filtroEstado === 'TODAS') return true;
    return c.estado === filtroEstado;
  });

  // Solicitud de validación de entrada
  const handleSolicitarUtilizar = (compra) => {
    setAccionError(null);
    setCompraAUtilizar(compra);
    setUtilizarModalVisible(true);
  };

  // Confirmación de utilización con recarga de datos
  const handleConfirmarUtilizar = async () => {
    if (!compraAUtilizar || utilizando) return;

    try {
      await marcarUtilizada(compraAUtilizar.id);
      setUtilizarModalVisible(false);
      setCompraAUtilizar(null);
      await reload();
    } catch (err) {
      setAccionError(err.message || 'Error al validar la entrada');
      reload();
    }
  };

  const eventoNombre = evento?.nombre || (compras.length > 0 ? compras[0].evento?.nombre : 'Ventas del evento');
  const fechaTexto = evento?.fecha ? formatFecha(evento.fecha) : (compras.length > 0 ? formatFecha(compras[0].evento?.fecha) : '');

  return (
    <Screen>
      {/* Barra superior con botón volver */}
      <View style={styles.topFixedBar}>
        <HardShadow offset={2} borderRadius={8}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backButtonText}>← VOLVER</Text>
          </Pressable>
        </HardShadow>
        <Text style={styles.screenTag}>VENTAS Y ACCESOS</Text>
      </View>

      <FlatList
        data={comprasFiltradas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.electricCobalt]}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {accionError && (
              <ErrorBanner message={accionError} onRetry={() => setAccionError(null)} />
            )}

            {/* Cabecera del Evento */}
            <HardShadow offset={4} borderRadius={12} style={styles.eventHeaderShadow}>
              <View style={styles.eventHeaderCard}>
                <Text style={styles.eventName}>{eventoNombre}</Text>
                {fechaTexto ? <Text style={styles.eventDate}>🗓️ {fechaTexto}</Text> : null}
              </View>
            </HardShadow>

            {/* Disponibilidad por Tipo de Entrada */}
            <Text style={styles.sectionHeading}>DISPONIBILIDAD POR TIPO</Text>
            {disponibilidadPorTipo.length > 0 ? (
              disponibilidadPorTipo.map((tipo) => (
                <AvailabilityBar key={tipo.tipoEntradaId} item={tipo} />
              ))
            ) : (
              <Text style={styles.emptyDisponibilidad}>
                No hay tipos de entrada definidos para este evento.
              </Text>
            )}

            {/* Filtros de Compras por Estado */}
            <View style={styles.comprasHeaderRow}>
              <Text style={styles.sectionHeading}>COMPRAS REGISTRADAS</Text>
              <Text style={styles.countBadge}>
                {comprasFiltradas.length} de {compras.length}
              </Text>
            </View>

            <View style={styles.filtersScroll}>
              {ESTADOS_FILTRO.map((st) => (
                <FilterChip
                  key={st}
                  label={st}
                  selected={filtroEstado === st}
                  onPress={() => setFiltroEstado(st)}
                  style={styles.chipSpacing}
                />
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <CompraRowOrganizador
            compra={item}
            isProcessing={utilizando && compraAUtilizar?.id === item.id}
            onPress={() => navigation.navigate('CompraDetalle', { id: item.id })}
            onSolicitarUtilizar={handleSolicitarUtilizar}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <LoadingView message="Cargando ventas y compras..." />
          ) : error ? (
            <ErrorBanner message={error} onRetry={reload} />
          ) : (
            <EmptyState
              icon="🎟️"
              title="SIN COMPRAS REGISTRADAS"
              subtitle={
                filtroEstado === 'TODAS'
                  ? 'Todavía ningún comprador adquirió entradas para este evento.'
                  : `No se encontraron compras en estado ${filtroEstado}.`
              }
            />
          )
        }
      />

      {/* Modal de confirmación de uso */}
      <ConfirmModal
        visible={utilizarModalVisible}
        title="¿MARCAR COMO UTILIZADA?"
        message={`Se validará el acceso de ${
          compraAUtilizar?.comprador?.nombre
            ? `${compraAUtilizar.comprador.nombre} ${compraAUtilizar.comprador.apellido || ''}`.trim()
            : 'este asistente'
        }. Esta acción no se puede deshacer.`}
        confirmText="SÍ, CANJEAR"
        cancelText="NO, CANCELAR"
        variant="primary"
        loading={utilizando}
        onConfirm={handleConfirmarUtilizar}
        onCancel={() => {
          setUtilizarModalVisible(false);
          setCompraAUtilizar(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topFixedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.inkBlack,
    backgroundColor: Colors.canvasTint,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    ...Typography.labelSm,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  screenTag: {
    ...Typography.headingSm,
    color: Colors.inkBlack,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 8,
  },
  eventHeaderShadow: {
    marginBottom: 16,
  },
  eventHeaderCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 14,
  },
  eventName: {
    ...Typography.headingMd,
    color: Colors.inkBlack,
    marginBottom: 4,
  },
  eventDate: {
    ...Typography.bodySm,
    color: '#555555',
    fontWeight: '700',
  },
  sectionHeading: {
    ...Typography.headingSm,
    fontSize: 15,
    color: Colors.inkBlack,
    marginBottom: 10,
    marginTop: 4,
  },
  emptyDisponibilidad: {
    ...Typography.bodySm,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  comprasHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  countBadge: {
    ...Typography.labelSm,
    color: Colors.electricCobalt,
    fontWeight: '900',
  },
  filtersScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chipSpacing: {
    marginBottom: 4,
  },
});
