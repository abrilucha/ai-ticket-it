import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { apiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { Screen } from '../components/Screen.js';
import { HardShadow } from '../components/HardShadow.js';
import { LoadingView } from '../components/LoadingView.js';
import { ErrorBanner } from '../components/ErrorBanner.js';
import { EmptyState } from '../components/EmptyState.js';

export function LoginScreen() {
  const { login } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    setError(null);
    try {
      const data = await apiClient('/usuarios');
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarUsuarios();
  };

  const compradores = usuarios.filter((u) => u.rol === 'COMPRADOR');
  const organizadores = usuarios.filter((u) => u.rol === 'ORGANIZADOR');

  const renderUsuarioCard = (item) => {
    const isOrg = item.rol === 'ORGANIZADOR';
    return (
      <HardShadow key={item.id} offset={3} borderRadius={10} style={styles.cardWrapper}>
        <Pressable
          onPress={() => login(item)}
          style={({ pressed }) => [
            styles.userCard,
            pressed && styles.userCardPressed,
          ]}
        >
          <View style={styles.avatarBox}>
            <Text style={styles.avatarEmoji}>{isOrg ? '🎙️' : '🎟️'}</Text>
          </View>
          <View style={styles.userTextCol}>
            <Text style={styles.userName}>
              {item.nombre} {item.apellido ? item.apellido : ''}
            </Text>
          </View>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isOrg ? Colors.electricCobalt : Colors.canaryYellow,
              },
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                { color: isOrg ? Colors.white : Colors.inkBlack },
              ]}
            >
              {item.rol}
            </Text>
          </View>
        </Pressable>
      </HardShadow>
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.electricCobalt]}
          />
        }
      >
        {/* Banner de Bienvenida Pop Art */}
        <View style={styles.heroSection}>
          <View style={styles.logoRow}>
            <Text style={styles.brandTitle}>AI TICKET</Text>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>IT!</Text>
            </View>
          </View>
          <Text style={styles.tagline}>POP KINETIC MOBILE TICKETING</Text>
          <Text style={styles.instructions}>
            Seleccioná una cuenta para ingresar según el rol que quieras probar. Sin contraseñas.
          </Text>
        </View>

        {loading ? (
          <LoadingView message="Cargando cuentas disponibles..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={cargarUsuarios} />
        ) : usuarios.length === 0 ? (
          <EmptyState
            title="NO HAY USUARIOS"
            subtitle="El backend en memoria no devolvió usuarios cargados en el seed."
            action={
              <Pressable onPress={cargarUsuarios} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>REINTENTAR</Text>
              </Pressable>
            }
          />
        ) : (
          <View style={styles.listsContainer}>
            {/* Sección Compradores */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>COMPRADORES</Text>
                <Text style={styles.sectionCount}>{compradores.length} DISPONIBLES</Text>
              </View>
              {compradores.map(renderUsuarioCard)}
            </View>

            {/* Sección Organizadores */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>ORGANIZADORES</Text>
                <Text style={styles.sectionCount}>{organizadores.length} DISPONIBLES</Text>
              </View>
              {organizadores.map(renderUsuarioCard)}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    ...Typography.headlineXl,
    color: Colors.inkBlack,
    marginRight: 8,
  },
  brandBadge: {
    backgroundColor: Colors.popVermilion,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    transform: [{ rotate: '-4deg' }],
  },
  brandBadgeText: {
    ...Typography.labelLg,
    color: Colors.white,
  },
  tagline: {
    ...Typography.labelMd,
    color: Colors.electricCobalt,
    marginTop: 6,
  },
  instructions: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 320,
  },
  listsContainer: {
    marginTop: 10,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderColor: Colors.inkBlack,
    paddingBottom: 4,
  },
  sectionTitle: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
  },
  sectionCount: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 12,
  },
  userCardPressed: {
    backgroundColor: Colors.surfaceDim,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  userTextCol: {
    flex: 1,
  },
  userName: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
  },
  roleBadgeText: {
    ...Typography.labelSm,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: Colors.electricCobalt,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
  },
  retryBtnText: {
    ...Typography.labelSm,
    color: Colors.white,
  },
});
