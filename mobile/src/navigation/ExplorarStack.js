import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CatalogoScreen } from '../screens/comprador/CatalogoScreen.js';
import { EventoDetalleScreen } from '../screens/comprador/EventoDetalleScreen.js';
import { OrganizadorPerfilScreen } from '../screens/comprador/OrganizadorPerfilScreen.js';

const Stack = createNativeStackNavigator();

/**
 * ExplorarStack
 * Stack de navegación para el flujo de exploración y compra:
 * Catálogo -> Detalle de evento -> Perfil del organizador
 */
export function ExplorarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Catalogo" component={CatalogoScreen} />
      <Stack.Screen name="EventoDetalle" component={EventoDetalleScreen} />
      <Stack.Screen name="OrganizadorPerfil" component={OrganizadorPerfilScreen} />
    </Stack.Navigator>
  );
}
