import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  RefreshControl,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  AppState,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { useAuth } from '../context/AuthContext.js';
import { useChat } from '../hooks/useChat.js';
import { useCompra } from '../hooks/useCompra.js';
import { Screen } from '../components/Screen.js';
import { HardShadow } from '../components/HardShadow.js';
import { StateBadge } from '../components/StateBadge.js';
import { LoadingView } from '../components/LoadingView.js';
import { ErrorBanner } from '../components/ErrorBanner.js';
import { EmptyState } from '../components/EmptyState.js';

export function ChatCompraScreen({ route, navigation }) {
  const { compraId, compra: compraInicial } = route.params || {};
  const { usuario } = useAuth();
  const isFocused = useIsFocused();

  // Detalle de la compra para cabecera e interlocutor
  const { data: compraCargada, reload: recargarCompra } = useCompra(compraId);
  const compra = compraCargada || compraInicial;

  useEffect(() => {
    recargarCompra();
  }, [recargarCompra]);

  // Hook del chat
  const {
    mensajes,
    loading,
    refreshing,
    enviando,
    error: chatError,
    enviar,
    recargar: recargarChat,
  } = useChat(compraId);

  const [texto, setTexto] = useState('');
  const [localError, setLocalError] = useState(null);

  const flatListRef = useRef(null);
  const inFlightRef = useRef(false);

  // Determinar roles e interlocutor
  const esOrganizador = usuario?.rol === 'ORGANIZADOR';

  const nombreEvento = compra?.evento?.nombre || 'Evento';
  const nombreComprador = compra?.comprador?.nombre
    ? `${compra.comprador.nombre} ${compra.comprador.apellido || ''}`.trim()
    : 'Comprador';
  const nombreOrganizador =
    compra?.evento?.organizador?.nombre ||
    compra?.organizador?.nombre ||
    'Organizador del evento';

  const nombreInterlocutor = esOrganizador ? nombreComprador : nombreOrganizador;
  const rolInterlocutorTag = esOrganizador ? 'COMPRADOR' : 'ORGANIZADOR';

  const esCancelada =
    compra?.estado === 'CANCELADA' || compra?.estado === 'REEMBOLSADA';

  // Polling cada 5 segundos cuando la pantalla está enfocada y la app en primer plano
  useEffect(() => {
    if (!isFocused || !compraId) return;

    const interval = setInterval(async () => {
      if (AppState.currentState !== 'active') return;
      if (inFlightRef.current) return; // Evitar solapamiento si hay una petición en curso

      inFlightRef.current = true;
      try {
        await recargarChat({ silencioso: true });
      } catch {
        // Errores de polling silencioso ignorados
      } finally {
        inFlightRef.current = false;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isFocused, compraId, recargarChat]);

  // Autoscroll hacia el último mensaje
  const scrollToEnd = (animated = true) => {
    if (flatListRef.current && mensajes.length > 0) {
      flatListRef.current.scrollToEnd({ animated });
    }
  };

  useEffect(() => {
    if (mensajes.length > 0) {
      setTimeout(() => scrollToEnd(true), 150);
    }
  }, [mensajes.length]);

  // Enviar mensaje
  const handleEnviar = async () => {
    const textoLimpio = texto.trim();
    if (!textoLimpio || enviando) return;

    if (textoLimpio.length > 1000) {
      setLocalError('El mensaje no puede superar los 1000 caracteres');
      return;
    }

    setLocalError(null);
    try {
      setTexto('');
      await enviar(textoLimpio);
      setTimeout(() => scrollToEnd(true), 100);
    } catch (err) {
      setLocalError(err.message || 'No se pudo enviar el mensaje.');
    }
  };

  const handleRefresh = async () => {
    inFlightRef.current = true;
    try {
      await Promise.all([recargarChat({ isRefresh: true }), recargarCompra()]);
    } finally {
      inFlightRef.current = false;
    }
  };

  const formatearHora = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const horas = String(d.getHours()).padStart(2, '0');
      const minutos = String(d.getMinutes()).padStart(2, '0');
      return `${horas}:${minutos}`;
    } catch {
      return '';
    }
  };

  const charsRestantes = 1000 - texto.length;
  const mostrarContador = texto.length >= 800;

  return (
    <Screen>
      {/* Barra superior con navegación y contexto */}
      <View style={styles.topBar}>
        <HardShadow offset={2} borderRadius={8}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Text style={styles.backButtonText}>← VOLVER</Text>
          </Pressable>
        </HardShadow>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {nombreEvento}
          </Text>
          <View style={styles.interlocutorRow}>
            <Text style={styles.interlocutorText} numberOfLines={1}>
              {nombreInterlocutor}
            </Text>
            <View style={styles.rolChip}>
              <Text style={styles.rolChipText}>{rolInterlocutorTag}</Text>
            </View>
          </View>
        </View>

        {compra?.estado ? <StateBadge estado={compra.estado} /> : null}
      </View>

      {/* Aviso si la compra fue cancelada o reembolsada */}
      {esCancelada && (
        <View style={styles.cancelBanner}>
          <Text style={styles.cancelBannerIcon}>ℹ️</Text>
          <Text style={styles.cancelBannerText}>
            La compra está {compra?.estado?.toLowerCase()}, pero el chat sigue disponible para consultas.
          </Text>
        </View>
      )}

      {/* Banner de errores si los hubiera */}
      {localError ? (
        <ErrorBanner message={localError} onRetry={() => setLocalError(null)} />
      ) : chatError ? (
        <ErrorBanner message={chatError} onRetry={() => recargarChat()} />
      ) : null}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {loading && mensajes.length === 0 ? (
          <LoadingView message="Cargando mensajes del chat..." />
        ) : (
          <FlatList
            ref={flatListRef}
            data={mensajes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollToEnd(false)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.electricCobalt]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="💬"
                title="SIN MENSAJES AÚN"
                subtitle={
                  esOrganizador
                    ? 'El comprador aún no inició la conversación. Podés escribirle para coordinar detalles.'
                    : 'Iniciá la conversación con el organizador para consultar dudas sobre la compra o el acceso.'
                }
              />
            }
            renderItem={({ item }) => {
              const esMio = Boolean(item.esPropio);
              const autorNombre = item.autor?.nombre || (esMio ? 'Vos' : 'Usuario');
              const autorRol = item.autor?.rol;
              const hora = formatearHora(item.fecha);

              return (
                <View
                  style={[
                    styles.messageRow,
                    esMio ? styles.messageRowMine : styles.messageRowOther,
                  ]}
                >
                  <View
                    style={[
                      styles.bubbleWrapper,
                      esMio ? styles.bubbleWrapperMine : styles.bubbleWrapperOther,
                    ]}
                  >
                    <HardShadow
                      offset={3}
                      borderRadius={12}
                      style={styles.bubbleShadow}
                    >
                      <View
                        style={[
                          styles.bubbleCard,
                          esMio ? styles.bubbleCardMine : styles.bubbleCardOther,
                        ]}
                      >
                        {/* Cabecera del autor dentro de la burbuja */}
                        <View style={styles.bubbleHeader}>
                          <Text
                            style={[
                              styles.authorName,
                              esMio ? styles.authorNameMine : styles.authorNameOther,
                            ]}
                          >
                            {esMio ? 'Vos' : autorNombre}
                          </Text>
                          {autorRol && (
                            <View
                              style={[
                                styles.authorRoleChip,
                                autorRol === 'ORGANIZADOR'
                                  ? styles.chipOrg
                                  : styles.chipComprador,
                              ]}
                            >
                              <Text style={styles.authorRoleChipText}>
                                {autorRol}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Texto del mensaje */}
                        <Text
                          style={[
                            styles.messageText,
                            esMio ? styles.messageTextMine : styles.messageTextOther,
                          ]}
                        >
                          {item.texto}
                        </Text>

                        {/* Hora */}
                        {hora ? (
                          <Text
                            style={[
                              styles.messageTime,
                              esMio ? styles.messageTimeMine : styles.messageTimeOther,
                            ]}
                          >
                            {hora}
                          </Text>
                        ) : null}
                      </View>
                    </HardShadow>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Barra de entrada de texto */}
        <View style={styles.inputContainer}>
          {mostrarContador && (
            <Text
              style={[
                styles.charCounter,
                charsRestantes < 50 && styles.charCounterWarning,
              ]}
            >
              {texto.length}/1000 caracteres
            </Text>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={texto}
              onChangeText={setTexto}
              placeholder="Escribí un mensaje..."
              placeholderTextColor={Colors.outline}
              multiline
              maxLength={1000}
              editable={!enviando}
            />

            <HardShadow offset={2} borderRadius={10} style={styles.sendButtonShadow}>
              <Pressable
                onPress={handleEnviar}
                disabled={enviando || !texto.trim()}
                style={({ pressed }) => [
                  styles.sendButton,
                  (!texto.trim() || enviando) && styles.sendButtonDisabled,
                  pressed && styles.sendButtonPressed,
                ]}
              >
                <Text style={styles.sendButtonText}>
                  {enviando ? '…' : 'ENVIAR'}
                </Text>
              </Pressable>
            </HardShadow>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.inkBlack,
    backgroundColor: Colors.canvasTint,
    gap: 10,
  },
  backButton: {
    backgroundColor: Colors.white,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
  },
  backButtonText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.titleMd,
    color: Colors.inkBlack,
    fontWeight: '800',
  },
  interlocutorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  interlocutorText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    maxWidth: 130,
  },
  rolChip: {
    backgroundColor: Colors.canaryYellow,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.inkBlack,
  },
  rolChipText: {
    ...Typography.labelSm,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.inkBlack,
  },
  cancelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 2,
    borderBottomColor: Colors.inkBlack,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  cancelBannerIcon: {
    fontSize: 16,
  },
  cancelBannerText: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.inkBlack,
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  messageRow: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubbleWrapper: {
    maxWidth: '82%',
  },
  bubbleWrapperMine: {
    alignItems: 'flex-end',
  },
  bubbleWrapperOther: {
    alignItems: 'flex-start',
  },
  bubbleShadow: {
    width: '100%',
  },
  bubbleCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
  },
  bubbleCardMine: {
    backgroundColor: Colors.electricCobalt,
  },
  bubbleCardOther: {
    backgroundColor: Colors.white,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  authorName: {
    ...Typography.labelSm,
    fontWeight: '800',
    fontSize: 11,
  },
  authorNameMine: {
    color: Colors.canaryYellow,
  },
  authorNameOther: {
    color: Colors.inkBlack,
  },
  authorRoleChip: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.inkBlack,
  },
  chipOrg: {
    backgroundColor: Colors.canaryYellow,
  },
  chipComprador: {
    backgroundColor: '#E0F2FE',
  },
  authorRoleChipText: {
    ...Typography.labelSm,
    fontSize: 8,
    fontWeight: '800',
    color: Colors.inkBlack,
  },
  messageText: {
    ...Typography.bodyMd,
    fontSize: 14,
    lineHeight: 19,
  },
  messageTextMine: {
    color: Colors.white,
  },
  messageTextOther: {
    color: Colors.inkBlack,
  },
  messageTime: {
    ...Typography.labelSm,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMine: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  messageTimeOther: {
    color: Colors.outline,
  },
  inputContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.canvasTint,
    borderTopWidth: 2,
    borderTopColor: Colors.inkBlack,
  },
  charCounter: {
    ...Typography.labelSm,
    fontSize: 11,
    color: Colors.outline,
    textAlign: 'right',
    marginBottom: 4,
  },
  charCounterWarning: {
    color: Colors.popVermilion,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    ...Typography.bodyMd,
    color: Colors.inkBlack,
  },
  sendButtonShadow: {},
  sendButton: {
    backgroundColor: Colors.canaryYellow,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
    borderColor: '#9CA3AF',
  },
  sendButtonPressed: {
    backgroundColor: Colors.canaryDark,
  },
  sendButtonText: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    fontWeight: '800',
    fontSize: 12,
  },
});
