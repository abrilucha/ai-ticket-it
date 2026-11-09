import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext.js';
import { UnsavedChangesProvider } from '../context/UnsavedChangesContext.js';
import { AuthStack } from './AuthStack.js';
import { CompradorTabs } from './CompradorTabs.js';
import { OrganizadorTabs } from './OrganizadorTabs.js';
import { LoadingView } from '../components/LoadingView.js';

const authBg = require('../../assets/auth-bg.jpg');

export function AppNavigator() {
  const { usuario, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <ImageBackground source={authBg} style={styles.bgImage} resizeMode="cover">
        <LoadingView message="Iniciando AI Ticket It..." />
      </ImageBackground>
    );
  }

  return (
    <UnsavedChangesProvider>
      <NavigationContainer>
        {!usuario ? (
          <AuthStack />
        ) : usuario.rol === 'ORGANIZADOR' ? (
          <OrganizadorTabs />
        ) : (
          <CompradorTabs />
        )}
      </NavigationContainer>
    </UnsavedChangesProvider>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
