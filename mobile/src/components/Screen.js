import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors.js';

/**
 * Screen
 * Contenedor base para todas las pantallas de la app.
 * Utiliza SafeAreaView con el fondo de papel prensa `#FAF8F5`.
 */
export function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
}) {
  return (
    <SafeAreaView style={[styles.root, style]} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          style={styles.root}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.canvasBase,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
