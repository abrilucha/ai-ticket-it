import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { ExplorarStack } from './ExplorarStack.js';
import { ComprasStack } from './ComprasStack.js';
import { FavoritosStack } from './FavoritosStack.js';
import { TabBarGradient } from '../components/TabBarGradient.js';
import { setAndroidBottomBar } from '../utils/systemBars.js';

const Tab = createBottomTabNavigator();

export function CompradorTabs() {
  useEffect(() => {
    setAndroidBottomBar('main');
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => <TabBarGradient />,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 2,
          borderTopColor: Colors.inkBlack,
          height: 62,
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.inkBlack,
        tabBarInactiveTintColor: 'rgba(10, 10, 10, 0.55)',
        tabBarLabelStyle: {
          ...Typography.labelSm,
          color: Colors.inkBlack,
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
      <Tab.Screen
        name="FavoritosTab"
        component={FavoritosStack}
        options={{
          tabBarLabel: 'FAVORITOS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size || 22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
