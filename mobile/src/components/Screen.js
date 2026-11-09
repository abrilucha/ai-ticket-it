import React from 'react';
import { View, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors.js';

const authBg = require('../../assets/auth-bg.jpg');

/**
 * Screen
 * Contenedor base para todas las pantallas de la app.
 * Renderiza el fondo de puntos semitono Pop Art bajo el contenido de la pantalla,
 * preservando las barras de encabezado y footer intactas con su fondo sólido.
 */
export function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
}) {
  return (
    <SafeAreaView style={[styles.root, style]} edges={['top', 'left', 'right']}>
      <ImageBackground source={authBg} style={styles.bgImage} resizeMode="cover">
        {scroll ? (
          <ScrollView
            style={styles.innerRoot}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.innerRoot, contentContainerStyle]}>{children}</View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.canvasBase,
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  innerRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
