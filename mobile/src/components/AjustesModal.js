import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { useAuth } from '../context/AuthContext.js';
import { actualizarPerfil } from '../api/auth.js';
import { HardShadow } from './HardShadow.js';
import { PopButton } from './PopButton.js';
import { PopInput } from './PopInput.js';
import { ErrorBanner } from './ErrorBanner.js';
import { ConfirmModal } from './ConfirmModal.js';
import { FotoPerfilPicker } from './FotoPerfilPicker.js';

export function AjustesModal({ visible, onClose }) {
  const { usuario, actualizarUsuario } = useAuth();
  const scrollViewRef = useRef(null);
  const fieldPositions = useRef({});

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);

  // Campos de cambio de email
  const [deseaCambiarEmail, setDeseaCambiarEmail] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [passwordEmail, setPasswordEmail] = useState('');
  const [showPasswordEmail, setShowPasswordEmail] = useState(false);

  // Campos de contraseña
  const [deseaCambiarPassword, setDeseaCambiarPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmPasswordNueva, setConfirmPasswordNueva] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [exitoMsg, setExitoMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);

  const isComprador = usuario?.rol === 'COMPRADOR';

  const isDirty = Boolean(
    (nombre.trim() !== (usuario?.nombre || '')) ||
    (apellido.trim() !== (usuario?.apellido || '')) ||
    (fotoPerfil !== (usuario?.fotoPerfil || null)) ||
    (deseaCambiarEmail && (nuevoEmail.trim() || passwordEmail)) ||
    (deseaCambiarPassword && (passwordActual || passwordNueva || confirmPasswordNueva))
  );

  const handleRequestClose = () => {
    if (isDirty) {
      setShowExitModal(true);
    } else {
      onClose();
    }
  };

  const limpiarErrorCampo = (campo) => {
    setFieldErrors((prev) => {
      if (!prev[campo]) return prev;
      const copy = { ...prev };
      delete copy[campo];
      return copy;
    });
    if (errorMsg) setErrorMsg(null);
  };

  // Sincronizar estado inicial al abrir modal
  useEffect(() => {
    if (visible && usuario) {
      setNombre(usuario.nombre || '');
      setApellido(usuario.apellido || '');
      setFotoPerfil(usuario.fotoPerfil || null);
      setDeseaCambiarEmail(false);
      setNuevoEmail('');
      setPasswordEmail('');
      setShowPasswordEmail(false);
      setDeseaCambiarPassword(false);
      setPasswordActual('');
      setPasswordNueva('');
      setConfirmPasswordNueva('');
      setErrorMsg(null);
      setExitoMsg(null);
      setFieldErrors({});
      setShowExitModal(false);
      setLoading(false);
    }
  }, [visible, usuario]);

  const handleGuardar = async () => {
    if (loading) return;
    setErrorMsg(null);
    setExitoMsg(null);
    setFieldErrors({});

    const nom = nombre.trim();
    const ape = apellido.trim();
    const errores = {};

    if (!nom) {
      errores.nombre = isComprador ? 'Ingresá tu nombre.' : 'Ingresá el nombre del organizador o productora.';
    }

    if (isComprador && !ape) {
      errores.apellido = 'El apellido es obligatorio para compradores.';
    }

    if (deseaCambiarEmail && nuevoEmail.trim()) {
      const emailTrim = nuevoEmail.trim().toLowerCase();
      if (!emailTrim.includes('@')) {
        errores.nuevoEmail = 'El formato del nuevo email es inválido.';
      }
      if (!passwordEmail) {
        errores.passwordEmail = 'Ingresá tu contraseña actual para confirmar.';
      }
    }

    if (deseaCambiarPassword || passwordNueva) {
      if (!passwordActual) {
        errores.passwordActual = 'Ingresá tu contraseña actual para confirmar.';
      }
      if (!passwordNueva) {
        errores.passwordNueva = 'Ingresá tu nueva contraseña.';
      } else if (passwordNueva.length < 8) {
        errores.passwordNueva = 'La nueva contraseña debe tener al menos 8 caracteres.';
      }
      if (passwordNueva !== confirmPasswordNueva) {
        errores.confirmPasswordNueva = 'Las contraseñas nuevas no coinciden.';
      }
    }

    if (Object.keys(errores).length > 0) {
      setFieldErrors(errores);
      const ordenCampos = ['nombre', 'apellido', 'nuevoEmail', 'passwordEmail', 'passwordActual', 'passwordNueva', 'confirmPasswordNueva'];
      const primerError = ordenCampos.find((campo) => errores[campo]);
      if (primerError) {
        setErrorMsg(errores[primerError]);
        const yPos = fieldPositions.current[primerError];
        if (typeof yPos === 'number' && scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: Math.max(0, yPos - 20), animated: true });
        }
      }
      return;
    }

    const payload = {
      nombre: nom,
      apellido: isComprador ? ape : (ape || null),
      fotoPerfil: fotoPerfil || null,
    };

    if (deseaCambiarEmail && nuevoEmail.trim()) {
      payload.email = nuevoEmail.trim().toLowerCase();
      payload.passwordActual = passwordEmail;
    }

    if (deseaCambiarPassword && passwordNueva) {
      payload.passwordActual = passwordActual;
      payload.passwordNueva = passwordNueva;
    }

    setLoading(true);
    try {
      const usuarioActualizado = await actualizarPerfil(payload);
      actualizarUsuario(usuarioActualizado);
      setExitoMsg('¡Perfil actualizado con éxito!');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setErrorMsg(err.message || 'Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleRequestClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <HardShadow offset={6} borderRadius={20} style={styles.dialogShadow}>
            <View style={styles.dialogCard}>
              {/* Header con botón cerrar */}
              <View style={styles.headerRow}>
                <View style={styles.titleBadge}>
                  <Text style={styles.titleBadgeText}>AJUSTES DE PERFIL</Text>
                </View>
                <Pressable onPress={handleRequestClose} style={styles.closeBtn} hitSlop={10}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* Mensajes de feedback */}
                {errorMsg ? (
                  <View style={styles.msgSlot}>
                    <ErrorBanner message={errorMsg} />
                  </View>
                ) : null}

                {exitoMsg ? (
                  <View style={styles.msgSlot}>
                    <View style={styles.successBanner}>
                      <Text style={styles.successBannerText}>✓ {exitoMsg}</Text>
                    </View>
                  </View>
                ) : null}

                {/* Selector de Foto de Perfil */}
                <FotoPerfilPicker
                  fotoUri={fotoPerfil}
                  onChangeFoto={setFotoPerfil}
                />

                {/* Campo Nombre */}
                <PopInput
                  label={isComprador ? 'NOMBRE *' : 'NOMBRE DEL ORGANIZADOR *'}
                  value={nombre}
                  error={fieldErrors.nombre}
                  onLayout={(e) => {
                    fieldPositions.current.nombre = e.nativeEvent.layout.y;
                  }}
                  onChangeText={(val) => {
                    setNombre(val);
                    limpiarErrorCampo('nombre');
                  }}
                  autoCapitalize="words"
                />

                {/* Campo Apellido */}
                {isComprador ? (
                  <PopInput
                    label="APELLIDO *"
                    value={apellido}
                    error={fieldErrors.apellido}
                    onLayout={(e) => {
                      fieldPositions.current.apellido = e.nativeEvent.layout.y;
                    }}
                    onChangeText={(val) => {
                      setApellido(val);
                      limpiarErrorCampo('apellido');
                    }}
                    autoCapitalize="words"
                  />
                ) : null}

                {/* Email actual y bloque desplegable para cambiarlo */}
                <View style={styles.emailContainer}>
                  <Text style={styles.emailLabel}>EMAIL</Text>
                  <View style={styles.currentEmailCard}>
                    <Text style={styles.currentEmailText}>{usuario?.email}</Text>
                  </View>

                  <View style={styles.collapsibleBox}>
                    <Pressable
                      onPress={() => setDeseaCambiarEmail(!deseaCambiarEmail)}
                      style={styles.toggleRow}
                    >
                      <Text style={styles.toggleText}>
                        {deseaCambiarEmail ? '▼ CANCELAR CAMBIO DE EMAIL' : '▶ CAMBIAR EMAIL'}
                      </Text>
                    </Pressable>

                    {deseaCambiarEmail ? (
                      <View style={styles.toggleContent}>
                        <PopInput
                          label="NUEVO EMAIL *"
                          value={nuevoEmail}
                          error={fieldErrors.nuevoEmail}
                          onLayout={(e) => {
                            fieldPositions.current.nuevoEmail = e.nativeEvent.layout.y;
                          }}
                          onChangeText={(val) => {
                            setNuevoEmail(val);
                            limpiarErrorCampo('nuevoEmail');
                          }}
                          placeholder="ej: nuevo@ejemplo.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />

                        <PopInput
                          label="CONTRASEÑA ACTUAL PARA CONFIRMAR *"
                          value={passwordEmail}
                          error={fieldErrors.passwordEmail}
                          onLayout={(e) => {
                            fieldPositions.current.passwordEmail = e.nativeEvent.layout.y;
                          }}
                          onChangeText={(val) => {
                            setPasswordEmail(val);
                            limpiarErrorCampo('passwordEmail');
                          }}
                          placeholder="Ingresá tu contraseña"
                          secureTextEntry={!showPasswordEmail}
                          autoCapitalize="none"
                        />

                        <Pressable
                          onPress={() => setShowPasswordEmail(!showPasswordEmail)}
                          style={styles.showPassBtn}
                        >
                          <Text style={styles.showPassBtnText}>
                            {showPasswordEmail ? 'OCULTAR CONTRASEÑA' : 'VER CONTRASEÑA'}
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Bloque Cambio de Contraseña */}
                <View style={styles.passwordSection}>
                  <Pressable
                    onPress={() => setDeseaCambiarPassword(!deseaCambiarPassword)}
                    style={styles.passwordToggleRow}
                  >
                    <Text style={styles.passwordToggleText}>
                      {deseaCambiarPassword ? '▼ CANCELAR CAMBIO DE CONTRASEÑA' : '▶ CAMBIAR CONTRASEÑA'}
                    </Text>
                  </Pressable>

                  {deseaCambiarPassword ? (
                    <View style={styles.passwordFields}>
                      <PopInput
                        label="CONTRASEÑA ACTUAL *"
                        value={passwordActual}
                        error={fieldErrors.passwordActual}
                        onLayout={(e) => {
                          fieldPositions.current.passwordActual = e.nativeEvent.layout.y;
                        }}
                        onChangeText={(val) => {
                          setPasswordActual(val);
                          limpiarErrorCampo('passwordActual');
                        }}
                        placeholder="Tu contraseña de hoy"
                        secureTextEntry={!showPasswords}
                        autoCapitalize="none"
                      />

                      <PopInput
                        label="NUEVA CONTRASEÑA *"
                        value={passwordNueva}
                        error={fieldErrors.passwordNueva}
                        onLayout={(e) => {
                          fieldPositions.current.passwordNueva = e.nativeEvent.layout.y;
                        }}
                        onChangeText={(val) => {
                          setPasswordNueva(val);
                          limpiarErrorCampo('passwordNueva');
                        }}
                        placeholder="Mínimo 8 car., 1 letra, 1 número"
                        secureTextEntry={!showPasswords}
                        autoCapitalize="none"
                      />

                      <PopInput
                        label="CONFIRMAR NUEVA CONTRASEÑA *"
                        value={confirmPasswordNueva}
                        error={fieldErrors.confirmPasswordNueva}
                        onLayout={(e) => {
                          fieldPositions.current.confirmPasswordNueva = e.nativeEvent.layout.y;
                        }}
                        onChangeText={(val) => {
                          setConfirmPasswordNueva(val);
                          limpiarErrorCampo('confirmPasswordNueva');
                        }}
                        placeholder="Repetí tu nueva contraseña"
                        secureTextEntry={!showPasswords}
                        autoCapitalize="none"
                      />

                      <Pressable
                        onPress={() => setShowPasswords(!showPasswords)}
                        style={styles.showPassBtn}
                      >
                        <Text style={styles.showPassBtnText}>
                          {showPasswords ? 'OCULTAR CONTRASEÑAS' : 'VER CONTRASEÑAS'}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>

                {/* Botón Guardar Cambios */}
                <View style={styles.saveBtnSlot}>
                  <PopButton
                    title={loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    variant="primary"
                    size="lg"
                    onPress={handleGuardar}
                    disabled={loading}
                  />
                </View>
              </ScrollView>
            </View>
          </HardShadow>
        </KeyboardAvoidingView>
      </View>

      {/* Modal de confirmación para descartar cambios en el perfil */}
      <ConfirmModal
        visible={showExitModal}
        title="¿DESCARTAR CAMBIOS?"
        message="Tenés modificaciones en tu perfil sin guardar. Si salís ahora perderás los cambios."
        confirmText="SÍ, DESCARTAR"
        cancelText="SEGUIR EDITANDO"
        variant="danger"
        onConfirm={() => {
          setShowExitModal(false);
          onClose();
        }}
        onCancel={() => setShowExitModal(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  keyboardContainer: {
    maxHeight: '92%',
  },
  dialogShadow: {
    width: '100%',
  },
  dialogCard: {
    backgroundColor: '#FFFBEB', // Tono cálido amarillito Pop Art
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 20,
    padding: 18,
    maxHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderColor: Colors.inkBlack,
    paddingBottom: 10,
  },
  titleBadge: {
    backgroundColor: Colors.canaryYellow, // Cartelito amarillo Pop Art
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
  },
  titleBadgeText: {
    ...Typography.titleMd,
    fontWeight: '900',
    color: Colors.inkBlack,
    letterSpacing: 0.5,
  },
  closeBtn: {
    backgroundColor: Colors.popVermilion,
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 18,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  msgSlot: {
    marginBottom: 10,
  },
  successBanner: {
    backgroundColor: '#86EFAC', // Verde pop alegre
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  successBannerText: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    fontWeight: '800',
  },
  emailContainer: {
    marginVertical: 6,
  },
  emailLabel: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    fontWeight: '800',
    marginBottom: 4,
  },
  currentEmailCard: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  currentEmailText: {
    ...Typography.bodyMedium,
    color: '#6B7280', // Grisesito que denota campo no editable directamente
    fontWeight: '500',
  },
  collapsibleBox: {
    padding: 10,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginVertical: 4,
  },
  toggleRow: {
    paddingVertical: 4,
  },
  toggleText: {
    ...Typography.labelSm,
    color: Colors.electricCobalt,
    fontWeight: '900',
  },
  toggleContent: {
    marginTop: 8,
  },
  passwordSection: {
    marginVertical: 8,
    padding: 10,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  passwordToggleRow: {
    paddingVertical: 4,
  },
  passwordToggleText: {
    ...Typography.labelSm,
    color: Colors.electricCobalt,
    fontWeight: '900',
  },
  passwordFields: {
    marginTop: 10,
  },
  showPassBtn: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.popVermilion,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  showPassBtnText: {
    ...Typography.labelSm,
    color: Colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
  saveBtnSlot: {
    marginTop: 16,
  },
});
