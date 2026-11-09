import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors.js';
import { Typography, FontFamily } from '../../theme/typography.js';
import { useAuth } from '../../context/AuthContext.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopButton } from '../../components/PopButton.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';

const authBg = require('../../../assets/auth-bg.jpg');

export function WelcomeScreen({ navigation }) {
  const { connectionError, reintentar } = useAuth();

  return (
    <ImageBackground source={authBg} style={styles.bgImage} resizeMode="cover">
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
                <View style={styles.logoRow}>
                  <Text style={styles.brandTitle}>AI TICKET</Text>
                  <View style={styles.brandBadge}>
                    <Text style={styles.brandBadgeText}>IT!</Text>
                  </View>
                </View>

                <Text style={styles.tagline}>
                  Tu plataforma con Inteligencia Artificial de venta, compra y validación de entradas para eventos
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
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
    backgroundColor: Colors.canvasTint,
    borderWidth: 3,
    borderColor: Colors.inkBlack,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 38,
    lineHeight: 44,
    color: Colors.inkBlack,
    marginRight: 8,
    letterSpacing: -0.8,
  },
  brandBadge: {
    backgroundColor: Colors.popVermilion,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    transform: [{ rotate: '-4deg' }],
    shadowColor: Colors.inkBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  brandBadgeText: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 24,
    lineHeight: 28,
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
