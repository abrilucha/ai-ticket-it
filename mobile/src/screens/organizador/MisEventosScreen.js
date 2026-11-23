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
import { useAuth } from '../../context/AuthContext.js';
import { useMisEventos } from '../../hooks/useMisEventos.js';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopButton } from '../../components/PopButton.js';
import { OrganizerEventCard } from '../../components/OrganizerEventCard.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';

export function MisEventosScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const { data: eventos, loading, error, reload } = useMisEventos();
  const [refreshing, setRefreshing] = useState(false);

  // Recarga reactiva al recibir foco
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <Screen>
      <Header usuario={usuario} onLogout={logout} />

      {/* Barra de acción superior del organizador */}
      <View style={styles.topActionBar}>
        <View style={styles.titleCol}>
          <Text style={styles.sectionTitle}>MIS EVENTOS</Text>
          <Text style={styles.sectionSubtitle}>
            {eventos.length} {eventos.length === 1 ? 'evento publicado' : 'eventos publicados'}
          </Text>
        </View>

        <View style={styles.buttonsRow}>
          {usuario?.id ? (
            <HardShadow offset={2} borderRadius={6} style={styles.repShadow}>
              <Pressable
                style={styles.reputacionBtn}
                onPress={() =>
                  navigation.navigate('OrganizadorPerfil', {
                    organizadorId: usuario.id,
                    organizadorNombre:
                      `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() ||
                      'Productora Rock Nacional',
                  })
                }
                hitSlop={6}
              >
                <Text style={styles.reputacionBtnText}>⭐ MI REPUTACIÓN</Text>
              </Pressable>
            </HardShadow>
          ) : null}

          <PopButton
            title="+ CREAR EVENTO"
            variant="primary"
            size="sm"
            onPress={() => navigation.navigate('CrearEvento')}
          />
        </View>
      </View>

      <FlatList
        data={eventos}
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
          <OrganizerEventCard
            evento={item}
            onPress={() => navigation.navigate('VentasEvento', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <LoadingView message="Cargando tus eventos..." />
          ) : error ? (
            <ErrorBanner message={error} onRetry={reload} />
          ) : (
            <EmptyState
              icon="🎪"
              title="NO TENÉS EVENTOS PUBLICADOS"
              subtitle="Creá tu primer evento con distintos tipos de entrada para comenzar a vender y gestionar accesos."
              action={
                <PopButton
                  title="CREAR MI PRIMER EVENTO"
                  variant="primary"
                  size="sm"
                  onPress={() => navigation.navigate('CrearEvento')}
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
  topActionBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.inkBlack,
    backgroundColor: Colors.canvasTint,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  titleCol: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.headingSm,
    color: Colors.inkBlack,
  },
  sectionSubtitle: {
    ...Typography.bodySm,
    color: '#666666',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repShadow: {
    backgroundColor: '#FFFFFF',
  },
  reputacionBtn: {
    backgroundColor: Colors.canaryYellow,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  reputacionBtnText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    fontWeight: '900',
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 80,
  },
});
