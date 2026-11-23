import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, ImageBackground, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors.js';
import { setAndroidBottomBar } from '../utils/systemBars.js';

const authBg = require('../../assets/auth-bg.jpg');

/**
 * Screen
 * Contenedor base para todas las pantallas de la app.
 * Renderiza el fondo de puntos semitono Pop Art bajo el contenido de la pantalla,
 * unificando la barra de notificaciones superior con el celeste del encabezado (#7DD3FC)
 * y la barra inferior de botones del sistema en rojo (#EF4444).
 */
export function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
}) {
  useEffect(() => {
    setAndroidBottomBar('main');
  }, []);
  return (
    <SafeAreaView style={[styles.root, style]} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.vibrantTurquoise} barStyle="dark-content" />
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
    backgroundColor: Colors.vibrantTurquoise, // Mismo turquesa de la barra superior para eliminar la franja rara
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
