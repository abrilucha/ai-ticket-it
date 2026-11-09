import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';

const LABELS = {
  1: '1 estrella · Muy mala',
  2: '2 estrellas · Mala',
  3: '3 estrellas · Regular',
  4: '4 estrellas · Buena',
  5: '5 estrellas · ¡Excelente!',
};

/**
 * RatingInput
 * Selector interactivo de estrellas (1 a 5) con estilo Pop Kinetic.
 */
export function RatingInput({ value = 0, onChange, disabled = false, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= value;
          return (
            <Pressable
              key={star}
              onPress={() => !disabled && onChange && onChange(star)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.starButton,
                pressed && !disabled && styles.starButtonPressed,
              ]}
              disabled={disabled}
              accessibilityLabel={`${star} estrellas`}
              accessibilityRole="button"
            >
              <Text style={[styles.starIcon, isFilled ? styles.starFilled : styles.starEmpty]}>
                ★
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.ratingLabel}>
        {value > 0 ? LABELS[value] : 'Tocá una estrella para calificar'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  starButtonPressed: {
    transform: [{ scale: 1.2 }],
  },
  starIcon: {
    fontSize: 40,
    letterSpacing: 2,
  },
  starFilled: {
    color: Colors.canaryDark,
    textShadowColor: Colors.inkBlack,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  starEmpty: {
    color: '#D1D5DB', // Gris claro visible
  },
  ratingLabel: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
});
