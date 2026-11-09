import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * Header
 * Barra superior con botón opcional para retroceder (onBack), logotipo Pop Art,
 * nombre de usuario activo, badge de rol y botón para cerrar sesión.
 */
export function Header({ usuario, onLogout, onBack = null }) {
  const isOrganizador = usuario?.rol === 'ORGANIZADOR';

  return (
    <View style={styles.container}>
      <View style={styles.brandingRow}>
        <View style={styles.leftSection}>
          {onBack ? (
            <HardShadow offset={2} borderRadius={6} style={styles.backBtnShadow}>
              <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
                <Text style={styles.backBtnText}>←</Text>
              </Pressable>
            </HardShadow>
          ) : null}

          <View style={styles.logoRow}>
            <Text style={styles.brandTitle}>AI TICKET</Text>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>IT!</Text>
            </View>
          </View>
        </View>

        {usuario ? (
          <View style={styles.userSection}>
            <View style={styles.userInfoCol}>
              <Text style={styles.userName} numberOfLines={1}>
                {usuario.nombre}{usuario.apellido ? ` ${usuario.apellido}` : ''}
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
                <Pressable onPress={onLogout} style={styles.logoutBtn} hitSlop={6}>
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnShadow: {
    marginRight: 10,
  },
  backBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    ...Typography.labelLg,
    color: Colors.inkBlack,
    fontSize: 16,
    lineHeight: 18,
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
    maxWidth: 110,
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
