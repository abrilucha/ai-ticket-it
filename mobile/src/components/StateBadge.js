import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';

/**
 * StateBadge
 * Muestra el estado canónico de una compra con su color semántico Pop Kinetic.
 * Estados: PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA.
 */
export function StateBadge({ estado, style }) {
  const config = Colors.estados[estado] || {
    bg: Colors.surfaceDim,
    text: Colors.inkBlack,
    border: Colors.inkBlack,
    label: estado || 'DESCONOCIDO',
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: config.text }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.labelSm,
  },
});
