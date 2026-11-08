import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { PopButton } from './PopButton.js';

/**
 * ConfirmModal
 * Modal de confirmación en estilo Pop Art para compras y cancelaciones.
 */
export function ConfirmModal({
  visible,
  title = '¿ESTÁS SEGURO?',
  message,
  confirmText = 'CONFIRMAR',
  cancelText = 'VOLVER',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={loading ? () => {} : onCancel}
    >
      <View style={styles.overlay}>
        <HardShadow offset={6} borderRadius={14} style={styles.cardShadow}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>
              {!loading && (
                <Pressable onPress={onCancel} hitSlop={10} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              )}
            </View>

            {message ? <Text style={styles.message}>{message}</Text> : null}

            {children ? <View style={styles.extraSlot}>{children}</View> : null}

            <View style={styles.actionsRow}>
              <View style={styles.btnCol}>
                <PopButton
                  title={cancelText}
                  variant="secondary"
                  disabled={loading}
                  size="md"
                  onPress={onCancel}
                />
              </View>
              <View style={styles.btnCol}>
                <PopButton
                  title={confirmText}
                  variant={variant}
                  loading={loading}
                  disabled={loading}
                  size="md"
                  onPress={onConfirm}
                />
              </View>
            </View>
          </View>
        </HardShadow>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardShadow: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 14,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.inkBlack,
  },
  message: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
    lineHeight: 22,
  },
  extraSlot: {
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btnCol: {
    flex: 1,
  },
});
