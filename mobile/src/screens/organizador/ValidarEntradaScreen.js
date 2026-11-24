import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { useAuth } from '../../context/AuthContext.js';
import { useValidarEntrada } from '../../hooks/useValidarEntrada.js';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopInput } from '../../components/PopInput.js';
import { PopButton } from '../../components/PopButton.js';
import { StateBadge } from '../../components/StateBadge.js';
import { ScanFrame } from '../../components/ScanFrame.js';
import { SegmentedFilter } from '../../components/SegmentedFilter.js';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { EmptyState } from '../../components/EmptyState.js';
import { LoadingView } from '../../components/LoadingView.js';
import { formatPrecio, formatFecha } from '../../utils/formato.js';
import { leerPayloadQR } from '../../utils/qr.js';
import { useFeedback } from '../../context/FeedbackContext.js';

const TABS = [
  { id: 'CAMARA', label: '📷 CÁMARA' },
  { id: 'MANUAL', label: '⌨️ INGRESO MANUAL' },
];

export function ValidarEntradaScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const isFocused = useIsFocused();

  // Modo activo: 'CAMARA' (por defecto) o 'MANUAL'
  const [modo, setModo] = useState('CAMARA');
  const [codigoInput, setCodigoInput] = useState('');
  const [inputError, setInputError] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [qrInvalidoMsg, setQrInvalidoMsg] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  // Permisos de cámara
  const [permission, requestPermission] = useCameraPermissions();

  // Bloqueo anti doble lectura
  const isScanningLocked = useRef(false);
  const { showLoading, hideLoading, showSuccess } = useFeedback();

  const {
    compra,
    loading,
    actionLoading,
    error,
    verificar,
    marcarUtilizada,
    reset,
  } = useValidarEntrada();

  // Desbloquear el escáner si no hay compra ni error bloqueante
  useEffect(() => {
    if (!compra && !loading) {
      isScanningLocked.current = false;
    }
  }, [compra, loading]);

  const handleSelectModo = (nuevoModo) => {
    setModo(nuevoModo);
    reset();
    setQrInvalidoMsg(null);
    setCameraError(null);
    isScanningLocked.current = false;
  };

  const handleBarcodeScanned = ({ data }) => {
    if (isScanningLocked.current || !isFocused || compra || loading) return;
    isScanningLocked.current = true;

    const compraId = leerPayloadQR(data);
    if (!compraId) {
      setQrInvalidoMsg('Código QR no reconocido (no pertenece a AI Ticket It)');
      setTimeout(() => {
        setQrInvalidoMsg(null);
        isScanningLocked.current = false;
      }, 2000);
      return;
    }

    setQrInvalidoMsg(null);
    verificar(compraId);
  };

  const handleBuscarManual = () => {
    if (!codigoInput.trim()) {
      setInputError('Ingresá un código o ID de compra.');
      return;
    }
    setInputError(null);
    verificar(codigoInput);
  };

  const handleConfirmarCanje = async () => {
    showLoading('Validando entrada...');
    try {
      await marcarUtilizada();
      setConfirmModalVisible(false);
      hideLoading();
      showSuccess('¡Entrada validada exitosamente!');
    } catch {
      hideLoading();
    }
  };

  const handleReset = () => {
    setCodigoInput('');
    setInputError(null);
    setQrInvalidoMsg(null);
    reset();
    isScanningLocked.current = false;
  };

  const compradorNombre = compra?.comprador?.nombre
    ? `${compra.comprador.nombre} ${compra.comprador.apellido || ''}`.trim()
    : 'Comprador anónimo';

  // Mensaje explicativo cuando no se puede utilizar
  let mensajeInvalido = null;
  if (compra && !compra.puedeUtilizar) {
    if (compra.estado === 'UTILIZADA') {
      mensajeInvalido = '⚠️ Esta entrada ya fue utilizada previamente.';
    } else if (compra.estado === 'PENDIENTE') {
      mensajeInvalido = '⏳ El pago de esta compra aún está pendiente.';
    } else if (compra.estado === 'CANCELADA' || compra.estado === 'REEMBOLSADA') {
      mensajeInvalido = '🚫 Esta compra fue cancelada o reembolsada.';
    } else {
      mensajeInvalido = 'No se puede canjear en su estado actual.';
    }
  }

  return (
    <Screen>
      <Header usuario={usuario} onLogout={logout} />

      {/* Selector de modo: CÁMARA vs INGRESO MANUAL */}
      <SegmentedFilter
        selectedTab={modo}
        onSelect={handleSelectModo}
        options={TABS}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* MODO CÁMARA */}
          {modo === 'CAMARA' && !compra && (
            <View style={styles.cameraSection}>
              {!permission ? (
                <LoadingView message="Verificando acceso a cámara..." />
              ) : !permission.granted ? (
                <HardShadow offset={4} borderRadius={12} style={styles.cardShadow}>
                  <View style={styles.permissionCard}>
                    <Text style={styles.permissionEmoji}>📷</Text>
                    <Text style={styles.permissionTitle}>PERMISO DE CÁMARA REQUERIDO</Text>
                    <Text style={styles.permissionDesc}>
                      AI Ticket It necesita acceder a la cámara para escanear y validar las entradas con código QR en los accesos.
                    </Text>

                    {permission.canAskAgain ? (
                      <View style={{ width: '100%', gap: 8, marginTop: 8 }}>
                        <PopButton
                          title="ACTIVAR CÁMARA"
                          variant="primary"
                          size="md"
                          onPress={requestPermission}
                        />
                        <PopButton
                          title="USAR INGRESO MANUAL"
                          variant="secondary"
                          size="md"
                          onPress={() => handleSelectModo('MANUAL')}
                        />
                      </View>
                    ) : (
                      <View style={{ width: '100%', gap: 8, marginTop: 8 }}>
                        <PopButton
                          title="⚙️ ABRIR AJUSTES"
                          variant="primary"
                          size="md"
                          onPress={() => Linking.openSettings()}
                        />
                        <PopButton
                          title="USAR INGRESO MANUAL"
                          variant="secondary"
                          size="md"
                          onPress={() => handleSelectModo('MANUAL')}
                        />
                      </View>
                    )}
                  </View>
                </HardShadow>
              ) : cameraError ? (
                <View style={styles.cameraErrorContainer}>
                  <ErrorBanner
                    message={cameraError}
                    onRetry={() => setCameraError(null)}
                  />
                  <PopButton
                    title="USAR INGRESO MANUAL"
                    variant="secondary"
                    size="md"
                    onPress={() => handleSelectModo('MANUAL')}
                    style={{ marginTop: 12 }}
                  />
                </View>
              ) : (
                <View style={styles.cameraContainer}>
                  {/* Visor de cámara con ScanFrame superpuesto como hijo directo */}
                  <View style={styles.cameraWrapper}>
                    {isFocused && (
                      <CameraView
                        style={styles.camera}
                        facing="back"
                        barcodeScannerSettings={{
                          barcodeTypes: ['qr'],
                        }}
                        onMountError={(err) =>
                          setCameraError(err?.message || 'Error al iniciar el hardware de la cámara.')
                        }
                        onBarcodeScanned={
                          isScanningLocked.current ? undefined : handleBarcodeScanned
                        }
                      >
                        {/* ScanFrame centrado directamente sobre el visor de la cámara */}
                        <View style={styles.overlayFrameWrapper} pointerEvents="none">
                          <ScanFrame
                            overlay={true}
                            label={loading ? 'VERIFICANDO...' : 'APUNTÁ AL QR'}
                          />
                        </View>

                        {/* Notificación flotante de QR no reconocido */}
                        {qrInvalidoMsg && (
                          <View style={styles.toastContainer}>
                            <Text style={styles.toastText}>⚠️ {qrInvalidoMsg}</Text>
                          </View>
                        )}
                      </CameraView>
                    )}
                  </View>

                  <Text style={styles.cameraHint}>
                    Apuntá el marco al código QR que te muestre el comprador en su celular.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* MODO MANUAL */}
          {modo === 'MANUAL' && !compra && (
            <>
              {/* Marco decorativo Pop Art para modo manual */}
              <ScanFrame label="INGRESO MANUAL" />

              {/* Formulario de ingreso manual de código */}
              <HardShadow offset={4} borderRadius={12} style={styles.cardShadow}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>VALIDAR ENTRADA (CONTROL DE ACCESO)</Text>
                  <Text style={styles.cardSubtitle}>
                    Ingresá o pegá el identificador único del ticket para verificar su autenticidad y estado de pago.
                  </Text>

                  <PopInput
                    label="CÓDIGO O ID DE COMPRA *"
                    placeholder="Ej: cmp_confirmada_1"
                    value={codigoInput}
                    onChangeText={(val) => {
                      setCodigoInput(val);
                      if (inputError) setInputError(null);
                      if (error) reset();
                    }}
                    error={inputError || (error && !compra ? error : null)}
                    autoCapitalize="none"
                  />

                  <PopButton
                    title="VERIFICAR ENTRADA"
                    variant="primary"
                    size="md"
                    loading={loading}
                    disabled={loading}
                    onPress={handleBuscarManual}
                    style={styles.buscarBtn}
                  />
                </View>
              </HardShadow>
            </>
          )}

          {/* Banner de error si falló la búsqueda / validación */}
          {error && !compra && (
            <ErrorBanner
              message={error}
              onRetry={modo === 'MANUAL' && codigoInput.trim() ? handleBuscarManual : handleReset}
            />
          )}

          {/* TARJETA DE RESULTADO DE VERIFICACIÓN (Común a Cámara y Manual) */}
          {compra && (
            <HardShadow offset={4} borderRadius={12} style={styles.resultShadow}>
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>RESULTADO DE VERIFICACIÓN</Text>
                  <StateBadge estado={compra.estado} />
                </View>

                {/* Evento y fecha */}
                <View style={styles.infoGroup}>
                  <Text style={styles.infoLabel}>EVENTO:</Text>
                  <Text style={styles.infoValueBold}>{compra.evento?.nombre || 'Evento'}</Text>
                  {compra.evento?.fecha && (
                    <Text style={styles.infoDate}>🗓️ {formatFecha(compra.evento.fecha)}</Text>
                  )}
                </View>

                {/* Asistente (SIN EMAIL) */}
                <View style={styles.infoGroup}>
                  <Text style={styles.infoLabel}>ASISTENTE / TITULAR:</Text>
                  <Text style={styles.infoValue}>👤 {compradorNombre}</Text>
                </View>

                {/* Tipo de entrada y cantidad */}
                <View style={styles.infoGroupRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>TIPO DE ENTRADA:</Text>
                    <Text style={styles.infoValueBold}>
                      {compra.tipoEntrada?.nombre || 'General'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.infoLabel}>CANTIDAD:</Text>
                    <Text style={styles.infoValueBold}>{compra.cantidad || 1}</Text>
                  </View>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL ABONADO:</Text>
                  <Text style={styles.totalValue}>{formatPrecio(compra.total)}</Text>
                </View>

                {/* Advertencia si no se puede utilizar */}
                {mensajeInvalido && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>{mensajeInvalido}</Text>
                  </View>
                )}

                {/* Botón para marcar como utilizada */}
                {compra.puedeUtilizar && (
                  <View style={styles.actionSlot}>
                    <PopButton
                      title="✓ MARCAR COMO UTILIZADA"
                      variant="canary"
                      size="lg"
                      loading={actionLoading}
                      disabled={actionLoading}
                      onPress={() => setConfirmModalVisible(true)}
                    />
                  </View>
                )}

                {/* Botón para volver a escanear o buscar otra */}
                <View style={styles.resetSlot}>
                  <PopButton
                    title={modo === 'CAMARA' ? '📷 ESCANEAR OTRA ENTRADA' : '⌨️ VERIFICAR OTRA ENTRADA'}
                    variant="secondary"
                    size="sm"
                    onPress={handleReset}
                  />
                </View>
              </View>
            </HardShadow>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de confirmación de canje */}
      <ConfirmModal
        visible={confirmModalVisible}
        title="¿CONFIRMAR INGRESO?"
        message={`Se marcará la entrada de ${compradorNombre} como UTILIZADA y se autorizará su acceso.`}
        confirmText="SÍ, MARCAR UTILIZADA"
        cancelText="CANCELAR"
        variant="primary"
        loading={actionLoading}
        onConfirm={handleConfirmarCanje}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  cameraSection: {
    marginBottom: 16,
  },
  cameraContainer: {
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  cameraWrapper: {
    width: '100%',
    height: 340,
    backgroundColor: '#000000',
    borderWidth: 3,
    borderColor: Colors.inkBlack,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  overlayFrameWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
    transform: [{ translateY: 48 }],
  },
  toastContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    alignItems: 'center',
  },
  toastText: {
    ...Typography.bodySm,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  cameraHint: {
    ...Typography.bodySm,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
  },
  permissionCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  permissionEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  permissionTitle: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    textAlign: 'center',
    marginBottom: 6,
  },
  permissionDesc: {
    ...Typography.bodySm,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 14,
  },
  cardShadow: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 14,
  },
  cardTitle: {
    ...Typography.headingSm,
    fontSize: 16,
    color: Colors.inkBlack,
    marginBottom: 4,
  },
  cardSubtitle: {
    ...Typography.bodySm,
    color: '#666666',
    marginBottom: 12,
  },
  buscarBtn: {
    marginTop: 8,
  },
  resultShadow: {
    marginTop: 10,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2.5,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EBE6DE',
    paddingBottom: 10,
    marginBottom: 12,
  },
  resultTitle: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    fontWeight: '900',
  },
  infoGroup: {
    marginBottom: 10,
  },
  infoGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    ...Typography.labelSm,
    color: '#666666',
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.bodyMd,
    color: Colors.inkBlack,
  },
  infoValueBold: {
    ...Typography.bodyMd,
    fontWeight: '800',
    color: Colors.inkBlack,
  },
  infoDate: {
    ...Typography.bodySm,
    color: '#555555',
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: '#EBE6DE',
    marginBottom: 12,
  },
  totalLabel: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    fontWeight: '700',
  },
  totalValue: {
    ...Typography.labelLg,
    color: Colors.electricCobalt,
    fontWeight: '900',
  },
  warningBox: {
    backgroundColor: '#FFF4E5',
    borderWidth: 1.5,
    borderColor: Colors.popVermilion,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  warningText: {
    ...Typography.bodySm,
    color: Colors.popVermilion,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionSlot: {
    marginTop: 6,
    marginBottom: 8,
  },
  resetSlot: {
    marginTop: 4,
  },
});
