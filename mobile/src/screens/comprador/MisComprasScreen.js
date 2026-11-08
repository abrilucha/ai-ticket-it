import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useAuth } from '../../context/AuthContext.js';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { EmptyState } from '../../components/EmptyState.js';
import { StateBadge } from '../../components/StateBadge.js';

export function MisComprasScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  return (
    <Screen>
      <Header
        usuario={usuario}
        onLogout={logout}
        onBack={() => navigation.navigate('ExplorarTab')}
      />
      <View style={styles.container}>
        <EmptyState
          icon="🎟️"
          title="BILLETERA DE ENTRADAS"
          subtitle="Pantalla marcador de compras. En la siguiente etapa se visualizarán tus compras reales con cupones troquelados, cálculo de días restantes y acciones según el estado de la compra."
        />

        {/* Muestra de los 5 badges de estado canónicos requeridos */}
        <View style={styles.badgesShowcase}>
          <Text style={styles.showcaseTitle}>ESTADOS CANÓNICOS SOPORTADOS:</Text>
          <View style={styles.badgeRow}>
            <StateBadge estado="PENDIENTE" style={styles.sampleBadge} />
            <StateBadge estado="CONFIRMADA" style={styles.sampleBadge} />
            <StateBadge estado="UTILIZADA" style={styles.sampleBadge} />
            <StateBadge estado="CANCELADA" style={styles.sampleBadge} />
            <StateBadge estado="REEMBOLSADA" style={styles.sampleBadge} />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  badgesShowcase: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
  },
  showcaseTitle: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleBadge: {
    marginRight: 6,
    marginBottom: 6,
  },
});
