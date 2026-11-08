import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MisEventosScreen } from '../screens/organizador/MisEventosScreen.js';
import { CrearEventoScreen } from '../screens/organizador/CrearEventoScreen.js';
import { VentasEventoScreen } from '../screens/organizador/VentasEventoScreen.js';
import { CompraDetalleScreen } from '../screens/comprador/CompraDetalleScreen.js';
import { EventoDetalleScreen } from '../screens/comprador/EventoDetalleScreen.js';
import { OrganizadorPerfilScreen } from '../screens/comprador/OrganizadorPerfilScreen.js';

const Stack = createNativeStackNavigator();

export function EventosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MisEventos" component={MisEventosScreen} />
      <Stack.Screen name="CrearEvento" component={CrearEventoScreen} />
      <Stack.Screen name="VentasEvento" component={VentasEventoScreen} />
      <Stack.Screen name="CompraDetalle" component={CompraDetalleScreen} />
      <Stack.Screen name="EventoDetalle" component={EventoDetalleScreen} />
      <Stack.Screen name="OrganizadorPerfil" component={OrganizadorPerfilScreen} />
    </Stack.Navigator>
  );
}
