import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { PopButton } from './PopButton.js';
import { HardShadow } from './HardShadow.js';

/**
 * ErrorBanner
 * Banner de error Pop Art con botón para reintentar la acción.
 */
export function ErrorBanner({
  message = 'Ocurrió un error inesperado',
  onRetry = null,
  style,
}) {
  return (
    <HardShadow offset={3} borderRadius={10} style={[styles.wrapper, style]}>
      <View style={styles.card}>
        <View style={styles.textCol}>
          <Text style={styles.header}>⚠ ERROR DE CONEXIÓN</Text>
          <Text style={styles.body}>{message}</Text>
        </View>
        {onRetry ? (
          <View style={styles.btnSlot}>
            <PopButton
              title="REINTENTAR"
              onPress={onRetry}
              variant="danger"
              size="sm"
            />
          </View>
        ) : null}
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.errorContainer,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 16,
  },
  textCol: {
    marginBottom: 10,
  },
  header: {
    ...Typography.labelLg,
    color: Colors.error,
    marginBottom: 4,
  },
  body: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
  },
  btnSlot: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
