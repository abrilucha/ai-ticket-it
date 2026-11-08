import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MisComprasScreen } from '../screens/comprador/MisComprasScreen.js';
import { CompraDetalleScreen } from '../screens/comprador/CompraDetalleScreen.js';
import { EventoDetalleScreen } from '../screens/comprador/EventoDetalleScreen.js';
import { OrganizadorPerfilScreen } from '../screens/comprador/OrganizadorPerfilScreen.js';
import { ChatCompraScreen } from '../screens/ChatCompraScreen.js';

const Stack = createNativeStackNavigator();

export function ComprasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MisCompras" component={MisComprasScreen} />
      <Stack.Screen name="CompraDetalle" component={CompraDetalleScreen} />
      <Stack.Screen name="EventoDetalle" component={EventoDetalleScreen} />
      <Stack.Screen name="OrganizadorPerfil" component={OrganizadorPerfilScreen} />
      <Stack.Screen name="ChatCompra" component={ChatCompraScreen} />
    </Stack.Navigator>
  );
}
