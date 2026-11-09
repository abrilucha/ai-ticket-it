import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../theme/colors.js';

/**
 * TabBarGradient
 * Fondo con degradado vertical para la barra de navegación de pestañas (tabs).
 * Comienza con turquesa vibrante (#06B6D4) en la parte superior y se difumina (fade out)
 * hacia blanco (#FFFFFF) en la parte inferior, conectando suavemente con la
 * barra de botones física del sistema Android.
 */
export function TabBarGradient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg height="100%" width="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="tabFadeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.vibrantTurquoise} stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#tabFadeGrad)" />
      </Svg>
    </View>
  );
}
