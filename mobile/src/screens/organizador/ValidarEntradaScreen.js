import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { formatPrecio, formatFecha } from '../../utils/formato.js';

export function ValidarEntradaScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const [codigoInput, setCodigoInput] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const {
    compra,
    loading,
    actionLoading,
    error,
    verificar,
    marcarUtilizada,
    reset,
  } = useValidarEntrada();

  const handleBuscar = () => {
    verificar(codigoInput);
  };

  const handleConfirmarCanje = async () => {
    await marcarUtilizada();
    setConfirmModalVisible(false);
  };

  const handleNuevaBusqueda = () => {
    setCodigoInput('');
    reset();
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Marco decorativo de escaneo Pop Art */}
          <ScanFrame />

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
                onChangeText={setCodigoInput}
                autoCapitalize="none"
              />

              <PopButton
                title="VERIFICAR ENTRADA"
                variant="primary"
                size="md"
                loading={loading}
                disabled={loading || !codigoInput.trim()}
                onPress={handleBuscar}
                style={styles.buscarBtn}
              />
            </View>
          </HardShadow>

          {/* Reporte de Error del Back (403, 404, etc.) */}
          {error && (
            <ErrorBanner
              message={error}
              onRetry={codigoInput.trim() ? handleBuscar : null}
            />
          )}

          {/* Comprobante de resultado */}
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

                {/* Botón para verificar otra entrada */}
                <View style={styles.resetSlot}>
                  <PopButton
                    title="VERIFICAR OTRA ENTRADA"
                    variant="secondary"
                    size="sm"
                    onPress={handleNuevaBusqueda}
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
    borderTopWidth: 1.5,
    borderTopColor: '#EBE6DE',
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  totalLabel: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
  },
  totalValue: {
    ...Typography.headingSm,
    color: Colors.electricCobalt,
  },
  warningBox: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1.5,
    borderColor: Colors.crimsonPunch,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  warningText: {
    ...Typography.bodySm,
    color: Colors.crimsonPunch,
    fontWeight: '700',
  },
  actionSlot: {
    marginTop: 4,
    marginBottom: 8,
  },
  resetSlot: {
    marginTop: 6,
  },
});
