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
import { FotoPerfilPicker } from '../../components/FotoPerfilPicker.js';

const authBg = require('../../../assets/auth-bg.jpg');

export function RegisterScreen({ navigation }) {
  const { registrar } = useAuth();

  const [rol, setRol] = useState('COMPRADOR');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isComprador = rol === 'COMPRADOR';

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

  const handleRegister = async () => {
    if (loading) return;
    setErrorMsg(null);

    const nom = nombre.trim();
    const ape = apellido.trim();
    const em = email.trim();

    if (!nom) {
      setErrorMsg(isComprador ? 'Ingresá tu nombre.' : 'Ingresá el nombre del organizador o productora.');
      return;
    }

    if (isComprador && !ape) {
      setErrorMsg('El apellido es obligatorio para compradores.');
      return;
    }

    if (!em) {
      setErrorMsg('Ingresá tu email.');
      return;
    }

    if (!password) {
      setErrorMsg('Ingresá una contraseña.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const datos = {
        nombre: nom,
        email: em,
        password,
        rol,
      };
      if (isComprador && ape) {
        datos.apellido = ape;
      }
      if (fotoPerfil) {
        datos.fotoPerfil = fotoPerfil;
      }

      await registrar(datos);
      // Al registrarse con éxito, AuthContext asigna `usuario` y `token`, derivando a la pantalla correspondiente
    } catch (err) {
      // Mostrar exactamente lo que responde el back (ej: "Ese email ya está registrado", etc.)
      setErrorMsg(err.message || 'Error al crear la cuenta');
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
                    <Text style={styles.titleBadgeText}>CREAR CUENTA</Text>
                  </View>
                  <Text style={styles.subtitle}>
                    Elegí tu rol en la plataforma para comenzar
                  </Text>
                </View>

              {/* Selector de Rol Pop Kinetic */}
              <View style={styles.roleSelectionBlock}>
                <Text style={styles.roleSelectionLabel}>TIPO DE CUENTA *</Text>
                <View style={styles.roleCardsRow}>
                  {/* Tarjeta Comprador */}
                  <Pressable
                    onPress={() => {
                      setRol('COMPRADOR');
                      if (errorMsg) setErrorMsg(null);
                    }}
                    style={[
                      styles.roleCard,
                      isComprador ? styles.roleCardSelected : styles.roleCardUnselected,
                    ]}
                  >
                    <View style={styles.roleHeaderRow}>
                      <Text style={[styles.roleRadio, isComprador && styles.roleRadioSelected]}>
                        {isComprador ? '●' : '○'}
                      </Text>
                      <Text style={[styles.roleCardTitle, isComprador && styles.roleCardTitleSelected]}>
                        Soy comprador
                      </Text>
                    </View>
                    <Text style={styles.roleCardDesc}>
                      Descubrí eventos, comprá entradas y guardá tus tickets con QR.
                    </Text>
                  </Pressable>

                  {/* Tarjeta Organizador */}
                  <Pressable
                    onPress={() => {
                      setRol('ORGANIZADOR');
                      if (errorMsg) setErrorMsg(null);
                    }}
                    style={[
                      styles.roleCard,
                      !isComprador ? styles.roleCardSelected : styles.roleCardUnselected,
                    ]}
                  >
                    <View style={styles.roleHeaderRow}>
                      <Text style={[styles.roleRadio, !isComprador && styles.roleRadioSelected]}>
                        {!isComprador ? '●' : '○'}
                      </Text>
                      <Text style={[styles.roleCardTitle, !isComprador && styles.roleCardTitleSelected]}>
                        Soy organizador
                      </Text>
                    </View>
                    <Text style={styles.roleCardDesc}>
                      Publicá eventos, administrá la venta y validá accesos en puerta.
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Foto de perfil opcional */}
              <FotoPerfilPicker
                fotoUri={fotoPerfil}
                onChangeFoto={setFotoPerfil}
              />

              {/* Banner de Error sin perder lo escrito */}
              {errorMsg ? (
                <View style={styles.errorSlot}>
                  <ErrorBanner message={errorMsg} />
                </View>
              ) : null}

              {/* Nombre */}
              <PopInput
                label={isComprador ? 'NOMBRE *' : 'NOMBRE DEL ORGANIZADOR O PRODUCTORA *'}
                value={nombre}
                onChangeText={(text) => {
                  setNombre(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={isComprador ? 'ej: Lucas' : 'ej: Productora Rock'}
                autoCapitalize="words"
                autoCorrect={false}
              />

              {/* Apellido (solo comprador) */}
              {isComprador ? (
                <PopInput
                  label="APELLIDO *"
                  value={apellido}
                  onChangeText={(text) => {
                    setApellido(text);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="ej: García"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              ) : null}

              {/* Email */}
              <PopInput
                label="EMAIL *"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="ej: usuario@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />

              {/* Contraseña */}
              <PopInput
                label="CONTRASEÑA *"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Mínimo 8 caracteres"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
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
              <Text style={styles.passwordHint}>
                Requisitos: mínimo 8 caracteres, al menos una letra y un número.
              </Text>

              {/* Repetir Contraseña */}
              <PopInput
                label="REPETIR CONTRASEÑA *"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Repetí tu contraseña"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
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

              {/* Botón Crear Cuenta */}
              <View style={styles.submitSlot}>
                <PopButton
                  title="CREAR CUENTA"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  onPress={handleRegister}
                  style={styles.submitBtn}
                />
              </View>

              {/* Enlace a Login */}
              <View style={styles.linkRow}>
                <Text style={styles.linkPrompt}>¿Ya tenés cuenta?</Text>
                <Pressable
                  onPress={() => navigation.navigate('Login')}
                  hitSlop={8}
                >
                  <Text style={styles.linkAction}> Iniciá sesión acá</Text>
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
    paddingBottom: 40,
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
    marginTop: 4,
  },
  roleSelectionBlock: {
    marginBottom: 20,
  },
  roleSelectionLabel: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    marginBottom: 8,
  },
  roleCardsRow: {
    gap: 12,
  },
  roleCard: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
  },
  roleCardSelected: {
    borderColor: Colors.inkBlack,
    backgroundColor: '#7DD3FC',
  },
  roleCardUnselected: {
    borderColor: Colors.inkBlack,
    backgroundColor: Colors.canvasTint,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleRadio: {
    fontSize: 16,
    marginRight: 8,
    color: Colors.inkBlack,
  },
  roleRadioSelected: {
    color: Colors.inkBlack,
  },
  roleCardTitle: {
    ...Typography.titleSm,
    color: Colors.inkBlack,
    fontWeight: '700',
  },
  roleCardTitleSelected: {
    color: Colors.inkBlack,
    fontWeight: '800',
  },
  roleCardDesc: {
    ...Typography.bodySm,
    color: Colors.inkBlack,
    lineHeight: 16,
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
  passwordHint: {
    ...Typography.bodySm,
    color: Colors.outline,
    marginTop: -8,
    marginBottom: 16,
    fontSize: 12,
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
