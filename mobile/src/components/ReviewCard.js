import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { RatingStars } from './RatingStars.js';
import { formatFecha } from '../utils/formato.js';

/**
 * ReviewCard
 * Tarjeta de reseña Pop Art que muestra estrellas, comentario, autor con foto de perfil,
 * fecha y cartelito rojo interactivo con flechita para navegar al evento finalizado.
 */
export function ReviewCard({ resena, onPressEvento, style }) {
  if (!resena) return null;

  const tieneEvento = Boolean(resena.evento?.nombre);
  const autorInicial = (resena.autor?.nombre || 'C').trim().charAt(0).toUpperCase();

  return (
    <HardShadow offset={2} borderRadius={8} style={[styles.wrapper, style]}>
      <View style={styles.card}>
        {/* Cartelito rojo interactivo con flecha para ir al evento finalizado */}
        {tieneEvento ? (
          <Pressable
            disabled={!onPressEvento}
            onPress={() => onPressEvento && onPressEvento(resena.evento?.id)}
            style={({ pressed }) => [
              styles.eventoBadge,
              pressed && styles.eventoBadgePressed,
            ]}
          >
            <Text style={styles.eventoBadgeText} numberOfLines={1}>
              {resena.evento.nombre.toUpperCase()}
            </Text>
            <Ionicons name="arrow-forward" size={12} color={Colors.white} />
          </Pressable>
        ) : null}

        {/* Estrellas de puntuación */}
        <View style={styles.ratingRow}>
          <RatingStars puntaje={resena.puntaje} showCount={false} size="sm" />
        </View>

        {/* Comentario */}
        <Text style={styles.comentario}>"{resena.comentario}"</Text>

        {/* Autor con foto de perfil y nombre */}
        <View style={styles.autorRow}>
          {resena.autor?.fotoPerfil ? (
            <Image
              source={{ uri: resena.autor.fotoPerfil }}
              style={styles.avatarImg}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{autorInicial}</Text>
            </View>
          )}

          <View style={styles.autorInfoCol}>
            <Text style={styles.autorNombre}>
              {resena.autor?.nombre || 'Comprador verificado'}
            </Text>
            <Text style={styles.fecha}>{formatFecha(resena.fecha)}</Text>
          </View>
        </View>
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    padding: 12,
  },
  eventoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.popVermilion,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
    gap: 4,
  },
  eventoBadgePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  eventoBadgeText: {
    ...Typography.labelSm,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.white,
    maxWidth: 240,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  comentario: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  autorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceDim,
    paddingTop: 8,
  },
  avatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    marginRight: 8,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    backgroundColor: Colors.electricCobalt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarFallbackText: {
    ...Typography.labelSm,
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  autorInfoCol: {
    flex: 1,
  },
  autorNombre: {
    ...Typography.titleMd,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkBlack,
  },
  fecha: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
});
