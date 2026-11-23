import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * SuccessToast
 * Cartelito flotante Pop Art de confirmación exitosa con animación fade-in.
 * Muestra mensaje de éxito (ej: "Sesión iniciada con éxito", "Reseña publicada con éxito")
 * y se desvanece suavemente tras unos segundos o al tocarlo.
 */
export function SuccessToast({ visible, message, onDismiss }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-24)).current;
  const dismissTimer = useRef(null);

  useEffect(() => {
    if (visible && message) {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);

      // Entrada suave en fade-in y descenso elástico Pop Art
      opacity.setValue(0);
      translateY.setValue(-24);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Cierre automático con fade-out a los 2.8 segundos
      dismissTimer.current = setTimeout(() => {
        handleClose();
      }, 2800);
    } else {
      opacity.setValue(0);
      translateY.setValue(-24);
    }

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible, message]);

  const handleClose = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible || !message) return null;

  return (
    <View
      style={[
        styles.wrapper,
        { top: Math.max(insets.top, 16) + 10 },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <HardShadow offset={4} borderRadius={12}>
          <Pressable onPress={handleClose} style={styles.card} hitSlop={8}>
            {/* Ícono de éxito Pop Art */}
            <View style={styles.iconBadge}>
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            </View>

            {/* Texto del cartelito */}
            <Text style={styles.messageText} numberOfLines={2}>
              {message}
            </Text>
          </Pressable>
        </HardShadow>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
  },
  animatedContainer: {
    width: '100%',
    maxWidth: 380,
  },
  card: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success, // #10B981 verde esmeralda
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageText: {
    ...Typography.bodySm,
    fontWeight: '700',
    color: Colors.inkBlack,
    flex: 1,
  },
});
