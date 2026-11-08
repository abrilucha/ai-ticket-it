import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { HardShadow } from '../../components/HardShadow.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';

export function ExplorarScreen() {
  const { usuario, logout } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargarCategorias = useCallback(async () => {
    setError(null);
    try {
      const data = await apiClient('/categorias');
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al obtener categorías');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarCategorias();
  };

  return (
    <Screen>
      <Header usuario={usuario} onLogout={logout} />
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
        {/* Banner de bienvenida y comprobación de conectividad */}
        <HardShadow offset={3} borderRadius={10} style={styles.bannerWrapper}>
          <View style={styles.bannerCard}>
            <View style={styles.bannerTagRow}>
              <Text style={styles.bannerTag}>FASE 1: CONEXIÓN ACTIVA</Text>
              <Text style={styles.liveDot}>● ONLINE</Text>
            </View>
            <Text style={styles.bannerTitle}>EXPLORAR EVENTOS</Text>
            <Text style={styles.bannerBody}>
              Conectividad con la API y cliente HTTP comprobados correctamente. A continuación se listan las 5 categorías canónicas obtenidas en tiempo real de GET /categorias:
            </Text>
          </View>
        </HardShadow>

        {loading ? (
          <LoadingView message="Obteniendo categorías del backend..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={cargarCategorias} />
        ) : (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>CATEGORÍAS CANÓNICAS DEL SISTEMA</Text>
            <View style={styles.categoriesList}>
              {categorias.map((cat, idx) => (
                <HardShadow
                  key={cat.id || idx}
                  offset={3}
                  borderRadius={10}
                  style={styles.catCardWrapper}
                >
                  <View style={styles.catCard}>
                    <View style={styles.catHeader}>
                      <Text style={styles.catName}>{cat.nombre}</Text>
                      <View style={styles.catCodeBadge}>
                        <Text style={styles.catCodeText}>{cat.codigo}</Text>
                      </View>
                    </View>
                    <Text style={styles.catDesc}>
                      {cat.descripcion || 'Sin descripción'}
                    </Text>
                  </View>
                </HardShadow>
              ))}
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
  bannerWrapper: {
    marginBottom: 20,
  },
  bannerCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 16,
  },
  bannerTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bannerTag: {
    ...Typography.labelSm,
    color: Colors.electricCobalt,
  },
  liveDot: {
    ...Typography.labelSm,
    color: Colors.success,
  },
  bannerTitle: {
    ...Typography.headlineMd,
    color: Colors.inkBlack,
    marginBottom: 6,
  },
  bannerBody: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  categoriesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    ...Typography.labelLg,
    color: Colors.inkBlack,
    marginBottom: 12,
  },
  categoriesList: {
    gap: 12,
  },
  catCardWrapper: {
    marginBottom: 10,
  },
  catCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 14,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  catName: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
  },
  catCodeBadge: {
    backgroundColor: Colors.canaryYellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
  },
  catCodeText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
  },
  catDesc: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
});
