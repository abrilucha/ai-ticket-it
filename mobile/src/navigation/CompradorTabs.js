import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { ExplorarStack } from './ExplorarStack.js';
import { ComprasStack } from './ComprasStack.js';

const Tab = createBottomTabNavigator();

export function CompradorTabs() {
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
        name="ExplorarTab"
        component={ExplorarStack}
        options={{
          tabBarLabel: 'EXPLORAR',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MisComprasTab"
        component={ComprasStack}
        options={{
          tabBarLabel: 'MIS COMPRAS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket" size={size || 22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
