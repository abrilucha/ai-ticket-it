import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { EventosStack } from './EventosStack.js';
import { ValidarEntradaScreen } from '../screens/organizador/ValidarEntradaScreen.js';

const Tab = createBottomTabNavigator();

export function OrganizadorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.canvasTint,
          borderTopWidth: 2,
          borderTopColor: Colors.inkBlack,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.electricCobalt,
        tabBarInactiveTintColor: Colors.outline,
        tabBarLabelStyle: {
          ...Typography.labelSm,
        },
      }}
    >
      <Tab.Screen
        name="MisEventosTab"
        component={EventosStack}
        options={{
          tabBarLabel: 'MIS EVENTOS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ValidarEntrada"
        component={ValidarEntradaScreen}
        options={{
          tabBarLabel: 'VALIDAR ENTRADA',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size || 22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
