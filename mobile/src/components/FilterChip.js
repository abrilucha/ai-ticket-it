import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * FilterChip
 * Pastilla de categoría interactiva con bordes de tinta y sombra dura.
 * Tocar el chip activo lo desactiva.
 */
export function FilterChip({
  label,
  selected = false,
  onPress,
  activeColor = Colors.electricCobalt,
  activeTextColor = Colors.white,
  style,
}) {
  return (
    <HardShadow offset={selected ? 1 : 2} borderRadius={9999} style={[styles.wrapper, style]}>
      <Pressable
        onPress={onPress}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? activeColor : Colors.white,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              color: selected ? activeTextColor : Colors.inkBlack,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginRight: 8,
    marginVertical: 4,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.labelSm,
  },
});
