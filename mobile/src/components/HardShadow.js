import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';

/**
 * HardShadow
 * Renderiza una sombra desplazada dura y sólida (#0A0A0A) detrás del contenido,
 * compatible 100% con Android e iOS sin usar shadowOffset ni elevation.
 */
export function HardShadow({
  children,
  offset = 4,
  borderRadius = 0,
  isPressed = false,
  shadowColor = Colors.inkBlack,
  style,
  contentStyle,
}) {
  return (
    <View style={[styles.wrapper, style]}>
      {offset > 0 && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.shadowBlock,
            {
              backgroundColor: shadowColor,
              borderRadius,
              transform: [{ translateX: offset }, { translateY: offset }],
            },
          ]}
        />
      )}
      <View
        style={[
          styles.content,
          isPressed && {
            transform: [{ translateX: offset }, { translateY: offset }],
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  shadowBlock: {
    zIndex: 1,
  },
  content: {
    zIndex: 2,
  },
});
