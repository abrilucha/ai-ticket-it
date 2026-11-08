import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';

/**
 * ScanFrame
 * Marco decorativo de escaneo Pop Kinetic para la validación de accesos.
 * Modo manual decorativo: no inicializa cámaras físicas ni servicios externos.
 */
export function ScanFrame({ children, overlay = false, label, style }) {
  return (
    <View style={[styles.container, overlay && styles.overlayContainer, style]}>
      {/* Marco visor con esquineros Pop Art */}
      <View style={[styles.viewfinder, overlay && styles.overlayViewfinder]}>
        {/* Esquina superior izquierda */}
        <View style={[styles.corner, styles.cornerTL]} />
        {/* Esquina superior derecha */}
        <View style={[styles.corner, styles.cornerTR]} />
        {/* Esquina inferior izquierda */}
        <View style={[styles.corner, styles.cornerBL]} />
        {/* Esquina inferior derecha */}
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Retícula y mira central decorativa */}
        <View style={styles.scanLine} />

        {children ? (
          children
        ) : (
          <>
            <View style={styles.centerTarget}>
              <Text style={styles.centerIcon}>🎯</Text>
            </View>

            {/* Leyenda explicativa */}
            <View style={styles.labelContainer}>
              <Text style={styles.modePill}>{label || (overlay ? 'APUNTAR AL QR' : 'MODO MANUAL')}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const BORDER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  overlayContainer: {
    marginVertical: 0,
    backgroundColor: 'transparent',
  },
  overlayViewfinder: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1.5,
  },
  viewfinder: {
    width: 240,
    height: 240,
    backgroundColor: '#FAF8F5',
    borderWidth: 2,
    borderColor: '#D4CEBC',
    borderRadius: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.electricCobalt,
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
  },
  scanLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: Colors.crimsonPunch,
    opacity: 0.8,
  },
  centerTarget: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    fontSize: 32,
    opacity: 0.6,
  },
  labelContainer: {
    position: 'absolute',
    bottom: 16,
  },
  modePill: {
    ...Typography.labelSm,
    backgroundColor: Colors.canaryYellow,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    color: Colors.inkBlack,
    fontWeight: '900',
  },
});
