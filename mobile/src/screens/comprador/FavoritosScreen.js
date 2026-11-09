import React, { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useAuth } from '../../context/AuthContext.js';
import { useFavoritos } from '../../hooks/useFavoritos.js';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { EventCard } from '../../components/EventCard.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';
import { PopButton } from '../../components/PopButton.js';

export function FavoritosScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const { data: favoritos, loading, error, reload, setData } = useFavoritos();

  // Recarga al recuperar el foco para sincronizar cambios realizados en otras pantallas
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

  // Quitar un favorito desde esta pantalla retira la tarjeta de la lista cuando el back confirma
  const handleToggleFavorito = (nuevoEstado, eventoId) => {
    if (!nuevoEstado) {
      setData((prev) => prev.filter((item) => item.id !== eventoId));
    }
  };

  return (
    <Screen>
      <Header
        usuario={usuario}
        onLogout={logout}
        onBack={() => navigation.navigate('ExplorarTab')}
      />

      <FlatList
        data={favoritos}
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
          favoritos.length > 0 ? (
            <View style={styles.headerBlock}>
              <View style={styles.titleBadge}>
                <Text style={styles.titleBadgeText}>TUS FAVORITOS ({favoritos.length})</Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <EventCard
            evento={item}
            onPress={() => navigation.navigate('EventoDetalle', { id: item.id })}
            onToggleFavorito={handleToggleFavorito}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <LoadingView message="Cargando tus favoritos..." />
          ) : error ? (
            <View style={styles.errorContainer}>
              <ErrorBanner message={error} onRetry={reload} />
            </View>
          ) : (
            <EmptyState
              icon="❤️"
              title="SIN FAVORITOS"
              subtitle="Todavía no guardaste favoritos. Tocá el corazón de un evento para guardarlo."
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80,
  },
  headerBlock: {
    marginBottom: 12,
  },
  titleBadge: {
    backgroundColor: Colors.canaryYellow,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
  },
  titleBadgeText: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  errorContainer: {
    paddingTop: 20,
  },
});
