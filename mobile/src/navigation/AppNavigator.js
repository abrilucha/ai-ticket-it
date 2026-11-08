import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext.js';
import { LoginScreen } from '../screens/LoginScreen.js';
import { CompradorTabs } from './CompradorTabs.js';
import { OrganizadorTabs } from './OrganizadorTabs.js';
import { LoadingView } from '../components/LoadingView.js';

export function AppNavigator() {
  const { usuario, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingView message="Iniciando AI Ticket It..." />;
  }

  return (
    <NavigationContainer>
      {!usuario ? (
        <LoginScreen />
      ) : usuario.rol === 'ORGANIZADOR' ? (
        <OrganizadorTabs />
      ) : (
        <CompradorTabs />
      )}
    </NavigationContainer>
  );
}
