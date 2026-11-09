import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  BackHandler,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useAuth } from '../../context/AuthContext.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopButton } from '../../components/PopButton.js';
import { PopInput } from '../../components/PopInput.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';

const authBg = require('../../../assets/auth-bg.jpg');

export function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [emailPink, setEmailPink] = useState(false);
  const [passwordPink, setPasswordPink] = useState(false);

  // Volver siempre a la primerísima pantalla (Welcome), tanto por botón físico como en pantalla
  const handleGoWelcome = useCallback(() => {
    navigation.navigate('Welcome');
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoWelcome();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [handleGoWelcome])
  );

  const handleLogin = async () => {
    if (loading) return;
    setErrorMsg(null);

    const emailTrim = email.trim();
    if (!emailTrim && !password) {
      setEmailPink(true);
      setPasswordPink(true);
      setErrorMsg('Por favor completá tu email y contraseña.');
      return;
    }

    if (!emailTrim) {
      setEmailPink(true);
      setErrorMsg('Por favor completá tu email.');
      return;
    }

    if (!password) {
      setPasswordPink(true);
      setErrorMsg('Por favor completá tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(emailTrim, password);
    } catch (err) {
      // Si el usuario no existe o las credenciales son inválidas, se pintan ambas en rosita
      setEmailPink(true);
      setPasswordPink(true);
      setErrorMsg(err.message || 'Email o contraseña incorrectos');
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={authBg} style={styles.bgImage} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Botón Volver (lleva a Welcome) */}
            <View style={styles.topBar}>
              <Pressable
                onPress={handleGoWelcome}
                style={styles.backBtn}
                hitSlop={10}
              >
                <Text style={styles.backBtnText}>← VOLVER</Text>
              </Pressable>
            </View>

            {/* Tarjeta de Formulario Pop Art */}
            <HardShadow offset={5} borderRadius={16} style={styles.formCardShadow}>
              <View style={styles.formCard}>
                <View style={styles.headerBlock}>
                  <View style={styles.titleBadge}>
                    <Text style={styles.titleBadgeText}>INICIAR SESIÓN</Text>
                  </View>
                  <Text style={styles.subtitle}>
                    Ingresá tus credenciales para acceder a tus eventos y compras
                  </Text>
                </View>

                {/* Banner de Error sin perder lo escrito */}
                {errorMsg ? (
                  <View style={styles.errorSlot}>
                    <ErrorBanner message={errorMsg} />
                  </View>
                ) : null}

                {/* Campo Email */}
                <PopInput
                  label="EMAIL *"
                  value={email}
                  isPink={emailPink}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailPink) setEmailPink(false);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="ej: usuario@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />

                {/* Campo Contraseña con Mostrar / Ocultar */}
                <PopInput
                  label="CONTRASEÑA *"
                  value={password}
                  isPink={passwordPink}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordPink) setPasswordPink(false);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Tu contraseña"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  rightComponent={
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                      hitSlop={8}
                    >
                      <Text style={styles.eyeBtnText}>
                        {showPassword ? 'OCULTAR' : 'VER'}
                      </Text>
                    </Pressable>
                  }
                />

                {/* Botón Ingresar */}
                <View style={styles.submitSlot}>
                  <PopButton
                    title="INGRESAR"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    disabled={loading}
                    onPress={handleLogin}
                    style={styles.submitBtn}
                  />
                </View>

                {/* Enlace a Registro */}
                <View style={styles.linkRow}>
                  <Text style={styles.linkPrompt}>¿No tenés cuenta?</Text>
                  <Pressable
                    onPress={() => navigation.navigate('Register')}
                    hitSlop={8}
                  >
                    <Text style={styles.linkAction}> Creá una acá</Text>
                  </Pressable>
                </View>
              </View>
            </HardShadow>
          </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: 'transparent',
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    justifyContent: 'center',
  },
  topBar: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backBtn: {
    backgroundColor: Colors.popVermilion,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: Colors.inkBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  backBtnText: {
    ...Typography.labelMd,
    color: Colors.white,
    fontWeight: '800',
  },
  formCardShadow: {
    width: '100%',
  },
  formCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 3,
    borderColor: Colors.inkBlack,
    borderRadius: 16,
    padding: 24,
  },
  headerBlock: {
    marginBottom: 20,
    alignItems: 'center',
  },
  titleBadge: {
    backgroundColor: Colors.canaryYellow,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 8,
  },
  titleBadgeText: {
    ...Typography.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.inkBlack,
    letterSpacing: 0.5,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
    textAlign: 'center',
    marginTop: 6,
  },
  errorSlot: {
    marginBottom: 16,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.popVermilion,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    shadowColor: Colors.inkBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  eyeBtnText: {
    ...Typography.labelSm,
    color: Colors.white,
    fontWeight: '800',
  },
  submitSlot: {
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtn: {
    width: '100%',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  linkPrompt: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
  },
  linkAction: {
    ...Typography.labelMd,
    color: Colors.electricCobalt,
    textDecorationLine: 'underline',
  },
});
