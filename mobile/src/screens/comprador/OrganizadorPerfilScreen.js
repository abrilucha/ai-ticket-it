import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { obtenerResenasOrganizador } from '../../api/organizadores.js';
import { Screen } from '../../components/Screen.js';
import { HardShadow } from '../../components/HardShadow.js';
import { RatingStars } from '../../components/RatingStars.js';
import { ReviewCard } from '../../components/ReviewCard.js';
import { LoadingView } from '../../components/LoadingView.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';

export function OrganizadorPerfilScreen({ route, navigation }) {
  const { organizadorId, organizadorNombre } = route.params || {};

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarResenas = useCallback(async () => {
    if (!organizadorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await obtenerResenasOrganizador(organizadorId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Error al obtener reseñas del organizador');
    } finally {
      setLoading(false);
    }
  }, [organizadorId]);

  useEffect(() => {
    cargarResenas();
  }, [cargarResenas]);

  const resenas = Array.isArray(data?.resenas) ? data.resenas : [];

  return (
    <Screen>
      {/* Barra superior fija con botón volver */}
      <View style={styles.topFixedBar}>
        <HardShadow offset={2} borderRadius={8}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backButtonText}>← VOLVER</Text>
          </Pressable>
        </HardShadow>
        <Text style={styles.screenTag}>PERFIL DE ORGANIZADOR</Text>
      </View>

      <FlatList
        data={resenas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Tarjeta de Reputación */}
            <HardShadow offset={4} borderRadius={12} style={styles.profileWrapper}>
              <View style={styles.profileCard}>
                <View style={styles.avatarRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarEmoji}>🎙️</Text>
                  </View>
                  <View style={styles.avatarInfo}>
                    <Text style={styles.orgLabel}>ORGANIZADOR VERIFICADO</Text>
                    <Text style={styles.orgName}>
                      {organizadorNombre || 'Productora'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.ratingSummaryRow}>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreNumber}>
                      {data?.puntajePromedio !== null && data?.puntajePromedio !== undefined
                        ? Number(data.puntajePromedio).toFixed(1)
                        : '-'}
                    </Text>
                    <Text style={styles.scoreScale}>/ 5.0</Text>
                  </View>
                  <View style={styles.starsCol}>
                    <RatingStars
                      puntaje={data?.puntajePromedio}
                      cantidad={data?.cantidadResenas}
                      size="md"
                    />
                    <Text style={styles.countText}>
                      {data?.cantidadResenas || 0} {data?.cantidadResenas === 1 ? 'opinión de asistentes' : 'opiniones de asistentes'}
                    </Text>
                  </View>
                </View>
              </View>
            </HardShadow>

            <Text style={styles.sectionHeading}>
              HISTORIAL COMPLETO DE OPINIONES ({resenas.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => <ReviewCard resena={item} />}
        ListEmptyComponent={
          loading ? (
            <LoadingView message="Cargando opiniones del organizador..." />
          ) : error ? (
            <ErrorBanner message={error} onRetry={cargarResenas} />
          ) : (
            <EmptyState
              icon="⭐"
              title="TODAVÍA NO TIENE RESEÑAS"
              subtitle="Este organizador no registra opiniones de compras anteriores en sus eventos."
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 16,
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
  profileWrapper: {
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  avatarInfo: {
    flex: 1,
  },
  orgLabel: {
    ...Typography.labelSm,
    color: Colors.electricCobalt,
    marginBottom: 2,
  },
  orgName: {
    ...Typography.headlineMd,
    color: Colors.inkBlack,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.surfaceDim,
    marginVertical: 14,
  },
  ratingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
  },
  scoreNumber: {
    ...Typography.headlineXl,
    color: Colors.inkBlack,
  },
  scoreScale: {
    ...Typography.bodyMd,
    color: Colors.outline,
    marginLeft: 2,
  },
  starsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  countText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeading: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    marginBottom: 8,
  },
});
