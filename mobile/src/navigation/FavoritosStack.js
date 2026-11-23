import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FavoritosScreen } from '../screens/comprador/FavoritosScreen.js';
import { EventoDetalleScreen } from '../screens/comprador/EventoDetalleScreen.js';
import { OrganizadorPerfilScreen } from '../screens/comprador/OrganizadorPerfilScreen.js';
import { EventoResenasScreen } from '../screens/comprador/EventoResenasScreen.js';
import { CompraDetalleScreen } from '../screens/comprador/CompraDetalleScreen.js';
import { ChatCompraScreen } from '../screens/ChatCompraScreen.js';

const Stack = createNativeStackNavigator();

/**
 * FavoritosStack
 * Stack de navegación para la pestaña de Favoritos:
 * Favoritos -> Detalle de evento -> Reseñas de evento -> Perfil del organizador -> Detalle de compra -> Chat
 */
export function FavoritosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Favoritos" component={FavoritosScreen} />
      <Stack.Screen name="EventoDetalle" component={EventoDetalleScreen} />
      <Stack.Screen name="EventoResenas" component={EventoResenasScreen} />
      <Stack.Screen name="OrganizadorPerfil" component={OrganizadorPerfilScreen} />
      <Stack.Screen name="CompraDetalle" component={CompraDetalleScreen} />
      <Stack.Screen name="ChatCompra" component={ChatCompraScreen} />
    </Stack.Navigator>
  );
}
