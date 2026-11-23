import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Colors } from '../theme/colors.js';
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

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  return (
    <UnsavedChangesProvider>
      <View style={styles.rootContainer}>
        <NavigationContainer theme={navTheme}>
          {!usuario ? (
            <ImageBackground source={authBg} style={styles.bgImage} resizeMode="cover">
              <AuthStack />
            </ImageBackground>
          ) : usuario.rol === 'ORGANIZADOR' ? (
            <OrganizadorTabs />
          ) : (
            <CompradorTabs />
          )}
        </NavigationContainer>
      </View>
    </UnsavedChangesProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
