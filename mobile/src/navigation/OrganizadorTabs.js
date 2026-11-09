import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { EventosStack } from './EventosStack.js';
import { ValidarEntradaScreen } from '../screens/organizador/ValidarEntradaScreen.js';
import { useUnsavedChanges } from '../context/UnsavedChangesContext.js';

const Tab = createBottomTabNavigator();

export function OrganizadorTabs() {
  const { checkBlocked } = useUnsavedChanges() || {};

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.popVermilion,
          borderTopWidth: 2,
          borderTopColor: Colors.inkBlack,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.75)',
        tabBarLabelStyle: {
          ...Typography.labelSm,
          color: Colors.white,
          fontWeight: '800',
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (checkBlocked) {
              const blocked = checkBlocked(() => {
                navigation.navigate('MisEventosTab', { screen: 'MisEventos' });
              });
              if (blocked) {
                e.preventDefault();
              }
            }
          },
        })}
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (checkBlocked) {
              const blocked = checkBlocked(() => {
                navigation.navigate('ValidarEntrada');
              });
              if (blocked) {
                e.preventDefault();
              }
            }
          },
        })}
      />
    </Tab.Navigator>
  );
}
