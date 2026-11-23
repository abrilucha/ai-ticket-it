import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * LoadingOverlay
 * Pantallita de carga modal Pop Art con circulito girando (ActivityIndicator)
 * y mensaje descriptivo para acciones importantes (login, registro, publicar evento/reseña, etc.).
 */
export function LoadingOverlay({ visible, message = 'Cargando...' }) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <HardShadow offset={6} borderRadius={16} style={styles.cardShadow}>
          <View style={styles.card}>
            {/* Indicador giratorio Pop Art */}
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={Colors.vibrantTurquoise} />
            </View>

            {/* Mensaje */}
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </HardShadow>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  cardShadow: {
    width: '100%',
    maxWidth: 320,
  },
  card: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageText: {
    ...Typography.headingSm,
    color: Colors.inkBlack,
    textAlign: 'center',
    lineHeight: 22,
  },
});
