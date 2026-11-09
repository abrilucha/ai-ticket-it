import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors.js';
import { useAuth } from '../../context/AuthContext.js';
import { useMisCompras } from '../../hooks/useMisCompras.js';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { TicketCard } from '../../components/TicketCard.js';
import { SegmentedFilter } from '../../components/SegmentedFilter.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';
import { PopButton } from '../../components/PopButton.js';

export function MisComprasScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const { data: compras, loading, error, reload } = useMisCompras();

  // Recargar al recibir foco
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const [selectedTab, setSelectedTab] = useState('ACTIVAS'); // 'ACTIVAS' | 'HISTORIAL'
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  // Agrupación visual por estado
  const comprasActivas = useMemo(() => {
    return compras.filter((c) => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA');
  }, [compras]);

  const comprasHistorial = useMemo(() => {
    return compras.filter(
      (c) => c.estado === 'UTILIZADA' || c.estado === 'CANCELADA' || c.estado === 'REEMBOLSADA'
    );
  }, [compras]);

  const displayedCompras = selectedTab === 'ACTIVAS' ? comprasActivas : comprasHistorial;

  return (
    <Screen>
      <Header
        usuario={usuario}
        onLogout={logout}
        onBack={() => navigation.navigate('ExplorarTab')}
      />

      {/* Selector segmentado de filtros: Activas / Historial */}
      <SegmentedFilter
        selectedTab={selectedTab}
        onSelect={setSelectedTab}
        counts={{
          activas: comprasActivas.length,
          historial: comprasHistorial.length,
        }}
      />

      <FlatList
        data={displayedCompras}
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
        renderItem={({ item }) => (
          <TicketCard
            compra={item}
            onPress={() => navigation.navigate('CompraDetalle', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <LoadingView message="Cargando tus entradas..." />
          ) : error ? (
            <ErrorBanner message={error} onRetry={reload} />
          ) : (
            <EmptyState
              icon={selectedTab === 'ACTIVAS' ? '🎟️' : '📋'}
              title={
                selectedTab === 'ACTIVAS'
                  ? 'NO TENÉS ENTRADAS ACTIVAS'
                  : 'HISTORIAL VACÍO'
              }
              subtitle={
                selectedTab === 'ACTIVAS'
                  ? 'Cuando reserves o pagues entradas para recitales y espectáculos, aparecerán acá.'
                  : 'Aún no tenés compras utilizadas, canceladas ni reembolsadas.'
              }
              action={
                <PopButton
                  title="EXPLORAR EVENTOS"
                  variant="primary"
                  size="sm"
                  onPress={() => navigation.navigate('ExplorarTab')}
                />
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
    paddingTop: 8,
    paddingBottom: 80,
  },
});
