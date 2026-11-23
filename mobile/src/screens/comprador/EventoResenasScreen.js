import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { Screen } from '../../components/Screen.js';
import { HardShadow } from '../../components/HardShadow.js';
import { RatingStars } from '../../components/RatingStars.js';
import { ReviewCard } from '../../components/ReviewCard.js';
import { EmptyState } from '../../components/EmptyState.js';

export function EventoResenasScreen({ route, navigation }) {
  const {
    organizadorNombre = 'Organizador',
    eventoNombre = 'Evento',
    resenas = [],
    puntaje = null,
    cantidadResenas = 0,
  } = route.params || {};

  const [criterio, setCriterio] = useState('fecha');
  const [direccion, setDireccion] = useState('desc');

  const handleToggleCriterio = (key) => {
    if (criterio === key) {
      setDireccion((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setCriterio(key);
      setDireccion('desc');
    }
  };

  const resenasOrdenadas = useMemo(() => {
    const copia = [...resenas];
    copia.sort((a, b) => {
      if (criterio === 'fecha') {
        const diff = new Date(b.fecha || 0) - new Date(a.fecha || 0);
        return direccion === 'desc' ? diff : -diff;
      } else {
        const diff = (b.puntaje || 0) - (a.puntaje || 0);
        return direccion === 'desc' ? diff : -diff;
      }
    });
    return copia;
  }, [resenas, criterio, direccion]);

  const tituloPrincipal = organizadorNombre || eventoNombre;

  return (
    <Screen>
      {/* Barra superior con botón volver en rojo */}
      <View style={styles.topFixedBar}>
        <HardShadow offset={2} borderRadius={8}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Text style={styles.backButtonText}>← VOLVER</Text>
          </Pressable>
        </HardShadow>
      </View>

      <FlatList
        data={resenasOrdenadas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <HardShadow offset={4} borderRadius={12} style={styles.summaryShadow}>
              <View style={styles.summaryCard}>
                <Text style={styles.subTitle}>OPINIONES DEL ORGANIZADOR</Text>
                <Text style={styles.eventoTitulo} numberOfLines={2}>
                  {tituloPrincipal}
                </Text>

                <View style={styles.ratingRow}>
                  <RatingStars
                    puntaje={puntaje}
                    cantidad={cantidadResenas}
                    size="md"
                  />
                </View>
              </View>
            </HardShadow>

            {/* Selector de ordenamiento idéntico al de eventos con flechita arriba / abajo */}
            <Text style={styles.ordenLabel}>ORDENAR POR:</Text>
            <View style={styles.chipsRow}>
              {/* Botón Fecha */}
              <HardShadow
                offset={criterio === 'fecha' ? 1 : 2}
                borderRadius={6}
                style={styles.chipShadow}
              >
                <Pressable
                  onPress={() => handleToggleCriterio('fecha')}
                  style={[
                    styles.chipBtn,
                    criterio === 'fecha' && styles.chipBtnActivo,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      criterio === 'fecha' && styles.chipBtnTextActivo,
                    ]}
                  >
                    Fecha {criterio === 'fecha' ? (direccion === 'asc' ? '↑' : '↓') : ''}
                  </Text>
                </Pressable>
              </HardShadow>

              {/* Botón Mejor valoradas */}
              <HardShadow
                offset={criterio === 'puntaje' ? 1 : 2}
                borderRadius={6}
                style={styles.chipShadow}
              >
                <Pressable
                  onPress={() => handleToggleCriterio('puntaje')}
                  style={[
                    styles.chipBtn,
                    criterio === 'puntaje' && styles.chipBtnActivo,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      criterio === 'puntaje' && styles.chipBtnTextActivo,
                    ]}
                  >
                    Mejor valoradas {criterio === 'puntaje' ? (direccion === 'asc' ? '↑' : '↓') : ''}
                  </Text>
                </Pressable>
              </HardShadow>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <ReviewCard
              resena={item}
              onPressEvento={(targetEventoId) => {
                if (targetEventoId) {
                  navigation.push('EventoDetalle', { eventoId: targetEventoId });
                }
              }}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="💬"
            title="SIN OPINIONES TODAVÍA"
            subtitle="Este organizador aún no tiene reseñas registradas de compradores."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topFixedBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
  },
  backButton: {
    backgroundColor: Colors.popVermilion,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  backButtonText: {
    ...Typography.labelMd,
    color: Colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 16,
  },
  summaryShadow: {
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  subTitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  eventoTitulo: {
    ...Typography.headlineSm,
    color: Colors.inkBlack,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  ratingRow: {
    marginTop: 2,
  },
  ordenLabel: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipShadow: {
    marginRight: 6,
    marginBottom: 6,
  },
  chipBtn: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipBtnActivo: {
    backgroundColor: Colors.canaryYellow,
  },
  chipBtnText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    fontWeight: '600',
  },
  chipBtnTextActivo: {
    fontWeight: '800',
  },
  itemWrapper: {
    marginBottom: 4,
  },
});
