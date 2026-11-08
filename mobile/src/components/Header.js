import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * Header
 * Barra superior con logotipo Pop Art, nombre de usuario activo,
 * badge de rol y botón para cerrar sesión.
 */
export function Header({ usuario, onLogout }) {
  const isOrganizador = usuario?.rol === 'ORGANIZADOR';

  return (
    <View style={styles.container}>
      <View style={styles.brandingRow}>
        <View style={styles.logoRow}>
          <Text style={styles.brandTitle}>AI TICKET</Text>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>IT!</Text>
          </View>
        </View>

        {usuario ? (
          <View style={styles.userSection}>
            <View style={styles.userInfoCol}>
              <Text style={styles.userName} numberOfLines={1}>
                {usuario.nombre}
              </Text>
              <View
                style={[
                  styles.rolePill,
                  {
                    backgroundColor: isOrganizador
                      ? Colors.electricCobalt
                      : Colors.canaryYellow,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rolePillText,
                    { color: isOrganizador ? Colors.white : Colors.inkBlack },
                  ]}
                >
                  {usuario.rol}
                </Text>
              </View>
            </View>

            {onLogout ? (
              <HardShadow offset={2} borderRadius={6}>
                <Pressable onPress={onLogout} style={styles.logoutBtn}>
                  <Text style={styles.logoutText}>SALIR</Text>
                </Pressable>
              </HardShadow>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.canvasBase,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: Colors.inkBlack,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    ...Typography.headlineMd,
    color: Colors.inkBlack,
    marginRight: 6,
  },
  brandBadge: {
    backgroundColor: Colors.popVermilion,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    transform: [{ rotate: '-3deg' }],
  },
  brandBadgeText: {
    ...Typography.labelSm,
    color: Colors.white,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoCol: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  userName: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
    maxWidth: 120,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    marginTop: 2,
  },
  rolePillText: {
    ...Typography.labelSm,
  },
  logoutBtn: {
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logoutText: {
    ...Typography.labelSm,
    color: Colors.popVermilion,
  },
});
