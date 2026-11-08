import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext.js';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { EmptyState } from '../../components/EmptyState.js';

export function ValidarEntradaScreen() {
  const { usuario, logout } = useAuth();

  return (
    <Screen>
      <Header usuario={usuario} onLogout={logout} />
      <View style={styles.container}>
        <EmptyState
          icon="📷"
          title="CONTROL DE ACCESO (O5)"
          subtitle="Pantalla marcador de Fase 1 para Validación de Entradas. En una fase posterior se integrará el visor de cámara con expo-camera y la alternativa de validación manual por ID de compra."
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
