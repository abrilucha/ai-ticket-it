import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { AjustesModal } from './AjustesModal.js';

/**
 * Header
 * Barra superior celeste con logotipo Pop Art, botón opcional de retroceso,
 * y avatar circular interactivo que despliega el menú de usuario (nombre, ajustes, salir).
 */
export function Header({ usuario, onLogout, onBack = null }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [ajustesVisible, setAjustesVisible] = useState(false);

  const isOrganizador = usuario?.rol === 'ORGANIZADOR';

  const handleOpenAjustes = () => {
    setMenuVisible(false);
    setAjustesVisible(true);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.brandingRow}>
          {/* Logo y botón volver */}
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

          {/* Avatar de Usuario interactivo */}
          {usuario ? (
            <Pressable
              onPress={() => setMenuVisible(true)}
              style={styles.avatarTrigger}
              hitSlop={6}
            >
              <HardShadow offset={2} borderRadius={20} style={styles.avatarShadow}>
                <View style={styles.avatarCircle}>
                  {usuario.fotoPerfil ? (
                    <Image
                      source={{ uri: usuario.fotoPerfil }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={20} color={Colors.inkBlack} />
                  )}
                </View>
              </HardShadow>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Cartelito desplegable de Usuario (Popover / Modal) */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuPositioner}>
                <HardShadow offset={5} borderRadius={16} style={styles.menuCardShadow}>
                  <View style={styles.menuCard}>
                    {/* Header del cartelito con info de usuario */}
                    <View style={styles.menuHeader}>
                      <View style={styles.menuAvatarLarge}>
                        {usuario?.fotoPerfil ? (
                          <Image
                            source={{ uri: usuario.fotoPerfil }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <Ionicons name="person" size={28} color={Colors.inkBlack} />
                        )}
                      </View>
                      <View style={styles.menuUserInfo}>
                        <Text style={styles.menuUserName} numberOfLines={1}>
                          {usuario?.nombre}{usuario?.apellido ? ` ${usuario.apellido}` : ''}
                        </Text>
                        <Text style={styles.menuUserEmail} numberOfLines={1}>
                          {usuario?.email}
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
                            {usuario?.rol}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Opción Ajustes */}
                    <Pressable
                      onPress={handleOpenAjustes}
                      style={styles.menuOption}
                    >
                      <Ionicons name="settings-sharp" size={18} color={Colors.inkBlack} />
                      <Text style={styles.menuOptionText}>AJUSTES DE PERFIL</Text>
                    </Pressable>

                    <View style={styles.divider} />

                    {/* Botón Salir en tarjetita roja */}
                    <HardShadow offset={3} borderRadius={10} style={styles.logoutShadow}>
                      <Pressable
                        onPress={handleLogout}
                        style={styles.logoutCardBtn}
                      >
                        <Ionicons name="log-out" size={18} color={Colors.white} />
                        <Text style={styles.logoutCardText}>CERRAR SESIÓN</Text>
                      </Pressable>
                    </HardShadow>
                  </View>
                </HardShadow>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Ajustes */}
      <AjustesModal
        visible={ajustesVisible}
        onClose={() => setAjustesVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7DD3FC', // Barra superior celeste Pop Art
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
  avatarTrigger: {
    padding: 2,
  },
  avatarShadow: {
    width: 38,
    height: 38,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    backgroundColor: Colors.canaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuPositioner: {
    width: 270,
  },
  menuCardShadow: {
    width: '100%',
  },
  menuCard: {
    backgroundColor: '#FFFBEB', // Amarillo cálido pop
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 16,
    padding: 14,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    backgroundColor: Colors.canaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
    fontWeight: '900',
  },
  menuUserEmail: {
    ...Typography.labelSm,
    color: Colors.outline,
    fontSize: 11,
    marginTop: 1,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  rolePillText: {
    ...Typography.labelSm,
    fontWeight: '800',
    fontSize: 10,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.inkBlack,
    marginVertical: 10,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  menuOptionText: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    fontWeight: '800',
  },
  logoutShadow: {
    marginTop: 4,
  },
  logoutCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.popVermilion, // Tarjetita roja para salir
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  logoutCardText: {
    ...Typography.labelMd,
    color: Colors.white,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
