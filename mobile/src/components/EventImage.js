import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';

const CATEGORIA_ICONS = {
  recitales_y_conciertos: { icon: '🎸', bg: Colors.cobaltLight },
  obras_de_teatro: { icon: '🎭', bg: Colors.vermilionLight },
  festivales: { icon: '🎪', bg: Colors.canaryLight },
  deportes: { icon: '⚽', bg: Colors.successLight },
  conferencias_y_charlas: { icon: '🎙️', bg: Colors.surfaceContainer },
};

/**
 * EventImage
 * Renderiza la imagen de un evento con fallback a recuadro Pop Art con icono
 * si la URL no existe, está vacía o falla su carga.
 */
export function EventImage({ uri, categoriaCodigo, style, height = 180, resizeMode = 'cover' }) {
  const [hasError, setHasError] = useState(false);

  const fallback = CATEGORIA_ICONS[categoriaCodigo] || { icon: '🎟️', bg: Colors.surfaceContainer };

  if (!uri || hasError) {
    return (
      <View
        style={[
          styles.fallbackContainer,
          { height, backgroundColor: fallback.bg },
          style,
        ]}
      >
        <Text style={styles.fallbackIcon}>{fallback.icon}</Text>
        <Text style={styles.fallbackText}>POP TICKET</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      onError={() => setHasError(true)}
      style={[{ height, width: '100%' }, style]}
      resizeMode={resizeMode}
    />
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderColor: Colors.inkBlack,
  },
  fallbackIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  fallbackText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    letterSpacing: 1,
  },
});
