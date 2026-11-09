import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useAuth } from '../../context/AuthContext.js';
import { Screen } from '../../components/Screen.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopButton } from '../../components/PopButton.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';

export function WelcomeScreen({ navigation }) {
  const { connectionError, reintentar } = useAuth();

  return (
    <Screen style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de error si el servidor no responde al iniciar */}
        {connectionError ? (
          <View style={styles.errorBannerContainer}>
            <ErrorBanner
              message={connectionError}
              onRetry={reintentar}
            />
          </View>
        ) : null}

        {/* Tarjeta Hero / Logo Pop Art */}
        <View style={styles.heroSection}>
          <HardShadow offset={6} borderRadius={20} style={styles.logoCardShadow}>
            <View style={styles.logoCard}>
              <View style={styles.badgeTop}>
                <Text style={styles.badgeTopText}>ENTRADAS SEGURAS</Text>
              </View>

              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTitle}>AI TICKET</Text>
                <View style={styles.brandExclBadge}>
                  <Text style={styles.brandExclText}>IT!</Text>
                </View>
              </View>

              <Text style={styles.tagline}>
                Tu plataforma de venta, compra y validación de entradas para eventos en vivo con Inteligencia Artificial.
              </Text>
            </View>
          </HardShadow>
        </View>

        {/* Opciones de Acceso Pop Kinetic */}
        <View style={styles.actionsSection}>
          <View style={styles.buttonSlot}>
            <PopButton
              title="INICIAR SESIÓN"
              variant="primary"
              size="lg"
              onPress={() => navigation.navigate('Login')}
              style={styles.actionBtn}
            />
          </View>

          <View style={styles.buttonSlot}>
            <PopButton
              title="CREAR CUENTA"
              variant="canary"
              size="lg"
              onPress={() => navigation.navigate('Register')}
              style={styles.actionBtn}
            />
          </View>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Accedé como comprador para ver tus tickets o como organizador para gestionar tus eventos.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.creamBg,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  errorBannerContainer: {
    marginBottom: 20,
  },
  heroSection: {
    marginBottom: 36,
    alignItems: 'center',
  },
  logoCardShadow: {
    width: '100%',
  },
  logoCard: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.inkBlack,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  badgeTop: {
    backgroundColor: Colors.canaryYellow,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  badgeTopText: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    letterSpacing: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    ...Typography.displayLg,
    color: Colors.inkBlack,
  },
  brandExclBadge: {
    backgroundColor: Colors.popPink,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
    transform: [{ rotate: '4deg' }],
  },
  brandExclText: {
    ...Typography.titleLg,
    color: Colors.white,
  },
  tagline: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 6,
  },
  actionsSection: {
    width: '100%',
    gap: 16,
  },
  buttonSlot: {
    width: '100%',
  },
  actionBtn: {
    width: '100%',
  },
  footerNote: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  footerText: {
    ...Typography.bodySm,
    color: Colors.outline,
    textAlign: 'center',
    lineHeight: 18,
  },
});
