import React, { useState, useCallback, useMemo } from 'react';
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
import { useEventos } from '../../hooks/useEventos.js';
import { useAuth } from '../../context/AuthContext.js';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { SearchBar } from '../../components/SearchBar.js';
import { SortSelector } from '../../components/SortSelector.js';
import { EventCard } from '../../components/EventCard.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';
import { PopButton } from '../../components/PopButton.js';
import { HardShadow } from '../../components/HardShadow.js';

export function CatalogoScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [orden, setOrden] = useState('fecha');
  const [direccion, setDireccion] = useState('asc');
  const [incluirRealizados, setIncluirRealizados] = useState(false);

  // Filtros combinados para el hook useEventos
  const filtros = useMemo(() => ({
    q: searchQuery,
    orden,
    direccion,
    incluirRealizados,
  }), [searchQuery, orden, direccion, incluirRealizados]);

  const { data: eventos, loading: eventosLoading, error, reload } = useEventos(filtros);

  // Recargar catálogo al recibir foco (mantiene reputación y cupos sincronizados)
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleLimpiarFiltros = () => {
    setSearchQuery('');
    setOrden('fecha');
    setDireccion('asc');
    setIncluirRealizados(false);
  };

  const hayFiltrosActivos = Boolean(
    searchQuery || incluirRealizados || orden !== 'fecha' || direccion !== 'asc'
  );

  return (
    <Screen>
      <Header usuario={usuario} onLogout={logout} />
      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
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
            {/* Buscador de cómic con debounce de 400ms */}
            <SearchBar
              value={searchQuery}
              onDebouncedChange={setSearchQuery}
            />

            {/* Controles de Ordenamiento e Historial */}
            <View style={styles.controlsRow}>
              <SortSelector
                orden={orden}
                direccion={direccion}
                onChange={(nuevoOrden, nuevaDir) => {
                  setOrden(nuevoOrden);
                  setDireccion(nuevaDir);
                }}
              />

              {/* Chip / Switch de Incluir Eventos Pasados */}
              <View style={styles.pasadosRow}>
                <HardShadow
                  offset={incluirRealizados ? 1 : 2}
                  borderRadius={8}
                >
                  <Pressable
                    onPress={() => setIncluirRealizados(!incluirRealizados)}
                    style={[
                      styles.pasadosBtn,
                      {
                        backgroundColor: incluirRealizados
                          ? Colors.canaryYellow
                          : Colors.white,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pasadosBtnText,
                        {
                          color: Colors.inkBlack,
                          fontWeight: incluirRealizados ? '900' : '700',
                        },
                      ]}
                    >
                      {incluirRealizados ? '✓ PASADOS INCLUIDOS' : '+ INCLUIR PASADOS'}
                    </Text>
                  </Pressable>
                </HardShadow>
              </View>
            </View>

            {/* Resumen del orden y resultados */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryCount}>
                {eventosLoading ? 'Buscando...' : `${eventos.length} ${eventos.length === 1 ? 'evento disponible' : 'eventos disponibles'}`}
              </Text>
              {hayFiltrosActivos && (
                <HardShadow offset={2} borderRadius={6}>
                  <Pressable
                    onPress={handleLimpiarFiltros}
                    style={styles.clearCardBtn}
                    hitSlop={6}
                  >
                    <Text style={styles.clearCardBtnText}>✕ LIMPIAR FILTROS</Text>
                  </Pressable>
                </HardShadow>
              )}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <EventCard
            evento={item}
            onPress={() => navigation.navigate('EventoDetalle', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          eventosLoading ? (
            <LoadingView message="Cargando eventos..." />
          ) : error ? (
            <ErrorBanner message={error} onRetry={reload} />
          ) : (
            <EmptyState
              icon="🔍"
              title="NO SE ENCONTRARON EVENTOS"
              subtitle="No hay eventos que coincidan con la búsqueda o filtros aplicados."
              action={
                hayFiltrosActivos ? (
                  <PopButton
                    title="LIMPIAR FILTROS"
                    variant="secondary"
                    size="sm"
                    onPress={handleLimpiarFiltros}
                  />
                ) : null
              }
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
  },
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  categoriesRow: {
    marginTop: 4,
    marginBottom: 6,
  },
  chipsScroll: {
    paddingVertical: 4,
  },
  controlsRow: {
    marginTop: 4,
  },
  pasadosRow: {
    marginTop: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  pasadosBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasadosBtnText: {
    ...Typography.labelSm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1.5,
    borderColor: Colors.surfaceDim,
    marginBottom: 12,
  },
  summaryCount: {
    ...Typography.titleMd,
    fontSize: 16,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  clearCardBtn: {
    backgroundColor: Colors.popVermilion,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearCardBtnText: {
    ...Typography.labelSm,
    color: Colors.white,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
