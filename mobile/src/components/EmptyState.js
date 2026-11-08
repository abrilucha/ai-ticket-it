import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * EmptyState
 * Viñeta informativa cuando no hay datos para mostrar.
 */
export function EmptyState({
  icon = '🎨',
  title = 'SIN DATOS',
  subtitle = 'No se encontraron elementos disponibles en esta sección.',
  action = null,
  style,
}) {
  return (
    <HardShadow offset={3} borderRadius={12} style={[styles.wrapper, style]}>
      <View style={styles.card}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {action ? <View style={styles.actionContainer}>{action}</View> : null}
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: 16,
  },
});
