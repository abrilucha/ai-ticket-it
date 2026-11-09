import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { Screen } from '../../components/Screen.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopInput } from '../../components/PopInput.js';
import { PopButton } from '../../components/PopButton.js';
import { EventImage } from '../../components/EventImage.js';
import { TicketTypeRow } from '../../components/TicketTypeRow.js';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { crearEvento } from '../../api/eventos.js';
import { parsearFechaHora, formatFecha } from '../../utils/formato.js';

export function CrearEventoScreen({ navigation }) {
  // Datos del evento (Strings libres obligatorios)
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Categoría (Clase Categoria del diagrama UML: nombre y descripción libres obligatorios)
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const [categoriaDescripcion, setCategoriaDescripcion] = useState('');

  // Fecha y hora
  const [fechaInput, setFechaInput] = useState('');
  const [horaInput, setHoraInput] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  // Tipos de entrada (inicia con 1 fila por defecto, sin límite)
  const [tiposEntrada, setTiposEntrada] = useState([
    { nombre: 'General', descripcion: '', precio: '', cupo: '' },
  ]);

  // Estados de validación y publicación
  const [publicando, setPublicando] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [descartarModalVisible, setDescartarModalVisible] = useState(false);

  // Formateador con máscara automática de fecha (DD/MM/AAAA)
  const handleFechaChange = (text) => {
    // Si el usuario borró sobre una barra '/', retroceder un caracter más
    if (text.length < fechaInput.length && fechaInput.endsWith('/')) {
      const sinBarra = fechaInput.slice(0, -1);
      setFechaInput(sinBarra.slice(0, -1));
      return;
    }
    const digits = text.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
      setFechaInput(digits);
    } else if (digits.length <= 4) {
      setFechaInput(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setFechaInput(`${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`);
    }
  };

  // Formateador con máscara automática de hora (HH:MM)
  const handleHoraChange = (text) => {
    // Si el usuario borró sobre ':', retroceder un caracter más
    if (text.length < horaInput.length && horaInput.endsWith(':')) {
      const sinPuntos = horaInput.slice(0, -1);
      setHoraInput(sinPuntos.slice(0, -1));
      return;
    }
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) {
      setHoraInput(digits);
    } else {
      setHoraInput(`${digits.slice(0, 2)}:${digits.slice(2)}`);
    }
  };

  // Parseo y validación de fecha y hora local
  const { date: fechaParsed, error: fechaError } = parsearFechaHora(fechaInput, horaInput);
  const esFechaPasada = fechaParsed ? fechaParsed <= new Date() : false;
  const fechaPreviewTexto =
    fechaParsed && !fechaError ? formatFecha(fechaParsed.toISOString()) : null;

  // Manejo de fotos con cámara y galería mediante expo-image-picker
  const handleTomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setApiError('Se requiere permiso para usar la cámara y capturar la portada.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagenUrl(result.assets[0].uri);
      }
    } catch (err) {
      setApiError('Error al abrir la cámara: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleElegirGaleria = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setApiError('Se requiere permiso para acceder a la galería de fotos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagenUrl(result.assets[0].uri);
      }
    } catch (err) {
      setApiError('Error al abrir la galería: ' + (err.message || 'Error desconocido'));
    }
  };

  // Detección de nombres duplicados en tipos de entrada
  const nombresLimpios = tiposEntrada.map((t) => (t.nombre || '').trim().toLowerCase());
  const nombresDuplicados = new Set(
    nombresLimpios.filter((n, idx) => n !== '' && nombresLimpios.indexOf(n) !== idx)
  );

  // Manejador de cambio en tipos de entrada
  const handleTipoChange = (index, campo, valor) => {
    setTiposEntrada((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [campo]: valor };
      return copy;
    });
  };

  // Agregar nuevo tipo de entrada (ilimitado)
  const handleAgregarTipo = () => {
    setTiposEntrada((prev) => [
      ...prev,
      { nombre: '', descripcion: '', precio: '', cupo: '' },
    ]);
  };

  // Quitar tipo de entrada (mínimo 1)
  const handleQuitarTipo = (index) => {
    if (tiposEntrada.length <= 1) return;
    setTiposEntrada((prev) => prev.filter((_, i) => i !== index));
  };

  // Chequeo de cambios para advertir al salir
  const tieneDatosCargados =
    nombre.trim() !== '' ||
    descripcion.trim() !== '' ||
    categoriaNombre.trim() !== '' ||
    categoriaDescripcion.trim() !== '' ||
    fechaInput.trim() !== '' ||
    horaInput.trim() !== '' ||
    imagenUrl.trim() !== '' ||
    tiposEntrada.some((t) => t.nombre.trim() !== '' || t.precio !== '' || t.cupo !== '');

  const handleVolver = () => {
    if (tieneDatosCargados) {
      setDescartarModalVisible(true);
    } else {
      navigation.goBack();
    }
  };

  // Envío del formulario
  const handlePublicar = async () => {
    if (publicando) return;
    setApiError(null);

    // Validaciones de cliente previas
    if (!nombre.trim() || nombre.trim().length < 2) {
      setApiError('El nombre del evento debe tener al menos 2 caracteres.');
      return;
    }
    if (!descripcion.trim() || descripcion.trim().length < 5) {
      setApiError('La descripción del evento debe tener al menos 5 caracteres.');
      return;
    }
    if (!categoriaNombre.trim()) {
      setApiError('Debés ingresar el nombre de la categoría.');
      return;
    }
    if (!categoriaDescripcion.trim()) {
      setApiError('Debés ingresar la descripción de la categoría.');
      return;
    }
    if (fechaError || !fechaParsed) {
      setApiError(fechaError || 'Debés ingresar una fecha y hora válidas (DD/MM/AAAA y HH:MM).');
      return;
    }
    if (esFechaPasada) {
      setApiError('La fecha del evento debe ser a futuro.');
      return;
    }
    if (tiposEntrada.length === 0) {
      setApiError('Debés incluir al menos un tipo de entrada.');
      return;
    }
    if (nombresDuplicados.size > 0) {
      setApiError('No puede haber tipos de entrada con nombres repetidos.');
      return;
    }

    for (let i = 0; i < tiposEntrada.length; i++) {
      const t = tiposEntrada[i];
      if (!t.nombre.trim()) {
        setApiError(`El nombre del tipo #${i + 1} es obligatorio.`);
        return;
      }
      const precioNum = Number(t.precio);
      if (t.precio === '' || isNaN(precioNum) || precioNum < 0) {
        setApiError(`El precio del tipo #${i + 1} debe ser mayor o igual a 0.`);
        return;
      }
      const cupoNum = Number(t.cupo);
      if (t.cupo === '' || isNaN(cupoNum) || cupoNum < 1 || !Number.isInteger(cupoNum)) {
        setApiError(`El cupo del tipo #${i + 1} debe ser un entero mayor a 0.`);
        return;
      }
    }

    setPublicando(true);

    try {
      const datosParaEnviar = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria: {
          nombre: categoriaNombre.trim(),
          descripcion: categoriaDescripcion.trim(),
        },
        fecha: fechaParsed.toISOString(),
        multimedia: imagenUrl.trim() ? [imagenUrl.trim()] : [],
        tiposEntrada: tiposEntrada.map((t) => ({
          nombre: t.nombre.trim(),
          descripcion: (t.descripcion || '').trim(),
          precio: Number(t.precio),
          cupo: Number(t.cupo),
        })),
      };

      await crearEvento(datosParaEnviar);
      navigation.goBack();
    } catch (err) {
      setApiError(err.message || 'Error al publicar el evento en el servidor.');
    } finally {
      setPublicando(false);
    }
  };

  return (
    <Screen>
      {/* Barra superior con botón volver */}
      <View style={styles.topFixedBar}>
        <HardShadow offset={2} borderRadius={8}>
          <Pressable onPress={handleVolver} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backButtonText}>← VOLVER</Text>
          </Pressable>
        </HardShadow>
        <Text style={styles.screenTag}>NUEVO EVENTO</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {apiError && (
            <ErrorBanner message={apiError} onRetry={() => setApiError(null)} />
          )}

          {/* 1. Tarjeta de Datos Básicos del Evento */}
          <HardShadow offset={4} borderRadius={12} style={styles.sectionShadow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>DATOS BÁSICOS DEL EVENTO</Text>

              <PopInput
                label="NOMBRE DEL EVENTO *"
                placeholder="Ej: Quilmes Rock 2027"
                value={nombre}
                onChangeText={setNombre}
                maxLength={80}
              />

              <PopInput
                label="DESCRIPCIÓN COMPLETA *"
                placeholder="Detallá bandas, cronograma, acceso o servicios..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
            </View>
          </HardShadow>

          {/* 2. Tarjeta de Categoría (Entidad Categoria: nombre y descripción libres) */}
          <HardShadow offset={4} borderRadius={12} style={styles.sectionShadow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>CATEGORÍA DEL EVENTO</Text>
              <Text style={styles.sectionSub}>
                Clase Categoría según el modelo UML (nombre y descripción libres).
              </Text>

              <PopInput
                label="NOMBRE DE LA CATEGORÍA *"
                placeholder="Ej: Recital de Rock, Teatro, Festival..."
                value={categoriaNombre}
                onChangeText={setCategoriaNombre}
                maxLength={50}
              />

              <PopInput
                label="DESCRIPCIÓN DE LA CATEGORÍA *"
                placeholder="Describí las características de esta categoría..."
                value={categoriaDescripcion}
                onChangeText={setCategoriaDescripcion}
                multiline
                numberOfLines={3}
                style={styles.textAreaSmall}
              />
            </View>
          </HardShadow>

          {/* 3. Tarjeta de Fecha y Hora con máscara automática */}
          <HardShadow offset={4} borderRadius={12} style={styles.sectionShadow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>FECHA Y HORA (HORA LOCAL)</Text>

              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeCol}>
                  <PopInput
                    label="FECHA (DD/MM/AAAA) *"
                    placeholder="15/04/2027"
                    value={fechaInput}
                    onChangeText={handleFechaChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                <View style={styles.dateTimeCol}>
                  <PopInput
                    label="HORA (HH:MM) *"
                    placeholder="21:00"
                    value={horaInput}
                    onChangeText={handleHoraChange}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              {/* Vista previa interpretada */}
              {fechaPreviewTexto && (
                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>VISTA PREVIA DE FECHA Y HORA:</Text>
                  <Text style={styles.previewText}>🗓️ {fechaPreviewTexto}</Text>
                </View>
              )}

              {/* Advertencias de fecha */}
              {fechaInput.length >= 8 && horaInput.length >= 4 && fechaError && (
                <Text style={styles.dateWarningText}>⚠️ {fechaError}</Text>
              )}
              {esFechaPasada && (
                <Text style={styles.dateWarningText}>
                  ⚠️ La fecha ingresada ya pasó. Debe ser una fecha a futuro.
                </Text>
              )}
            </View>
          </HardShadow>

          {/* 4. Tarjeta de Portada Multimedia (Galería o Cámara) */}
          <HardShadow offset={4} borderRadius={12} style={styles.sectionShadow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>PORTADA DEL EVENTO (OPCIONAL)</Text>
              <Text style={styles.sectionSub}>
                Cargá una foto real desde tu galería o sacá una foto con la cámara.
              </Text>

              <View style={styles.mediaActionsRow}>
                <View style={styles.mediaBtnSlot}>
                  <PopButton
                    title="🖼️ GALERÍA"
                    variant="neutral"
                    size="md"
                    onPress={handleElegirGaleria}
                  />
                </View>
                <View style={styles.mediaBtnSlot}>
                  <PopButton
                    title="📷 CÁMARA"
                    variant="neutral"
                    size="md"
                    onPress={handleTomarFoto}
                  />
                </View>
              </View>

              {imagenUrl.trim() !== '' && (
                <View style={styles.imagePreviewWrap}>
                  <View style={styles.previewHeaderRow}>
                    <Text style={styles.previewLabel}>FOTO SELECCIONADA:</Text>
                    <Pressable onPress={() => setImagenUrl('')} hitSlop={8}>
                      <Text style={styles.clearImgBtn}>✕ Quitar foto</Text>
                    </Pressable>
                  </View>
                  <View style={styles.imageBox}>
                    <EventImage uri={imagenUrl.trim()} style={styles.image} />
                  </View>
                </View>
              )}
            </View>
          </HardShadow>

          {/* 5. Tarjeta de Tipos de Entrada (sin límite de filas) */}
          <HardShadow offset={4} borderRadius={12} style={styles.sectionShadow}>
            <View style={styles.sectionCard}>
              <View style={styles.ticketsHeader}>
                <Text style={styles.sectionHeading}>TIPOS DE ENTRADA</Text>
                <Text style={styles.ticketsCountBadge}>
                  {tiposEntrada.length} {tiposEntrada.length === 1 ? 'tipo' : 'tipos'}
                </Text>
              </View>

              <Text style={styles.sectionSub}>
                Definí al menos una categoría de ticket con su nombre, precio y cupo inicial.
              </Text>

              {tiposEntrada.map((tipo, idx) => {
                const nombreLimpio = (tipo.nombre || '').trim().toLowerCase();
                const esDuplicado = nombreLimpio !== '' && nombresDuplicados.has(nombreLimpio);

                return (
                  <TicketTypeRow
                    key={idx}
                    index={idx}
                    item={tipo}
                    totalRows={tiposEntrada.length}
                    onChange={handleTipoChange}
                    onRemove={handleQuitarTipo}
                    isDuplicateName={esDuplicado}
                  />
                );
              })}

              <PopButton
                title="+ AGREGAR OTRO TIPO DE ENTRADA"
                variant="canary"
                size="md"
                onPress={handleAgregarTipo}
                style={styles.addTypeBtn}
              />
            </View>
          </HardShadow>

          {/* Botón Publicar */}
          <View style={styles.submitSection}>
            <PopButton
              title="PUBLICAR EVENTO"
              variant="primary"
              size="lg"
              loading={publicando}
              disabled={publicando}
              onPress={handlePublicar}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal para descartar cambios */}
      <ConfirmModal
        visible={descartarModalVisible}
        title="¿DESCARTAR CAMBIOS?"
        message="Si salís ahora, vas a perder la información que cargaste para este evento."
        confirmText="SÍ, SALIR"
        cancelText="SEGUIR EDITANDO"
        variant="danger"
        onConfirm={() => {
          setDescartarModalVisible(false);
          navigation.goBack();
        }}
        onCancel={() => setDescartarModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topFixedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.inkBlack,
    backgroundColor: Colors.canvasTint,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    ...Typography.labelSm,
    fontWeight: '900',
    color: Colors.inkBlack,
  },
  screenTag: {
    ...Typography.headingSm,
    color: Colors.inkBlack,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionShadow: {
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 12,
    padding: 14,
  },
  sectionHeading: {
    ...Typography.headingSm,
    fontSize: 16,
    color: Colors.inkBlack,
    marginBottom: 8,
  },
  sectionSub: {
    ...Typography.bodySm,
    color: '#666666',
    marginBottom: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    height: 70,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeCol: {
    flex: 1,
  },
  previewBox: {
    backgroundColor: '#EBE6DE',
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  previewLabel: {
    ...Typography.labelSm,
    color: '#555555',
    marginBottom: 2,
  },
  previewText: {
    ...Typography.bodyMd,
    fontWeight: '800',
    color: Colors.electricCobalt,
  },
  dateWarningText: {
    ...Typography.bodySm,
    color: Colors.crimsonPunch,
    fontWeight: '700',
    marginTop: 6,
  },
  mediaActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  mediaBtnSlot: {
    flex: 1,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  clearImgBtn: {
    ...Typography.labelSm,
    color: Colors.crimsonPunch,
    fontWeight: '700',
  },
  imagePreviewWrap: {
    marginTop: 6,
  },
  imageBox: {
    height: 180,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    marginTop: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ticketsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketsCountBadge: {
    ...Typography.labelSm,
    backgroundColor: Colors.canaryYellow,
    borderWidth: 1.5,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  addTypeBtn: {
    marginTop: 4,
  },
  submitSection: {
    marginTop: 8,
    marginBottom: 24,
  },
});
