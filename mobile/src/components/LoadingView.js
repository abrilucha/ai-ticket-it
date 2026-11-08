import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';

/**
 * LoadingView
 * Vista de carga estilizada Pop Art.
 */
export function LoadingView({ message = 'Cargando datos...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.electricCobalt} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.canvasBase,
  },
  text: {
    ...Typography.bodyLg,
    color: Colors.inkBlack,
    marginTop: 16,
    textAlign: 'center',
  },
});
