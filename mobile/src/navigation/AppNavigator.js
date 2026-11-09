import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext.js';
import { UnsavedChangesProvider } from '../context/UnsavedChangesContext.js';
import { AuthStack } from './AuthStack.js';
import { CompradorTabs } from './CompradorTabs.js';
import { OrganizadorTabs } from './OrganizadorTabs.js';
import { LoadingView } from '../components/LoadingView.js';

export function AppNavigator() {
  const { usuario, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingView message="Iniciando AI Ticket It..." />;
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
