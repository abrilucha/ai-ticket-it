import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useAuth } from '../../context/AuthContext.js';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { EmptyState } from '../../components/EmptyState.js';

export function MisEventosScreen() {
  const { usuario, logout } = useAuth();

  return (
    <Screen>
      <Header usuario={usuario} onLogout={logout} />
      <View style={styles.container}>
        <EmptyState
          icon="📋"
          title="PANEL DE EVENTOS"
          subtitle="Pantalla marcador de Fase 1 para Organizadores. En las siguientes fases podrás publicar eventos con múltiples tipos de entrada, ver métricas de ventas y consultar cupos disponibles."
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
