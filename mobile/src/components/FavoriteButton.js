import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors.js';
import { HardShadow } from './HardShadow.js';
import { useAuth } from '../context/AuthContext.js';
import { useToggleFavorito } from '../hooks/useFavoritos.js';

/**
 * FavoriteButton
 * Botón con icono de corazón en estilo Pop Kinetic con HardShadow y borde negro de 2px.
 * Área táctil mínima de 44x44. Accesible y exclusivo para usuarios con rol COMPRADOR.
 * Bloquea el botón mientras hay una petición en curso y no propaga eventos de toque a componentes padres.
 */
export function FavoriteButton({
  eventoId,
  esFavoritoInicial = false,
  onToggle = null,
  size = 22,
  style,
}) {
  const { usuario } = useAuth();
  const { esFavorito, procesando, alternar, error } = useToggleFavorito(
    eventoId,
    esFavoritoInicial,
    onToggle
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Favoritos', error);
    }
  }, [error]);

  // Requisito B1 y B3: Se muestra SOLO si el usuario autenticado es COMPRADOR
  if (usuario?.rol !== 'COMPRADOR') {
    return null;
  }

  const handlePress = async (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (procesando) return;
    await alternar();
  };

  const label = esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos';

  return (
    <HardShadow offset={2} borderRadius={22} style={[styles.shadowWrap, style]}>
      <Pressable
        onPress={handlePress}
        disabled={procesando}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={4}
        style={[
          styles.button,
          {
            backgroundColor: esFavorito ? Colors.popVermilion : Colors.white,
          },
        ]}
      >
        <Ionicons
          name={esFavorito ? 'heart' : 'heart-outline'}
          size={size}
          color={esFavorito ? Colors.white : Colors.inkBlack}
        />
      </Pressable>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    width: 44,
    height: 44,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
