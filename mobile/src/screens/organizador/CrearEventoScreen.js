import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors } from '../../theme/colors.js';
import { Typography } from '../../theme/typography.js';
import { Screen } from '../../components/Screen.js';
import { HardShadow } from '../../components/HardShadow.js';
import { PopInput } from '../../components/PopInput.js';
import { PopButton } from '../../components/PopButton.js';
import { FilterChip } from '../../components/FilterChip.js';
import { EventImage } from '../../components/EventImage.js';
import { TicketTypeRow } from '../../components/TicketTypeRow.js';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { ErrorBanner } from '../../components/ErrorBanner.js';
import { listarCategorias } from '../../api/categorias.js';
import { crearEvento } from '../../api/eventos.js';
import { parsearFechaHora, formatFecha } from '../../utils/formato.js';

export function CrearEventoScreen({ navigation }) {
  // Datos del evento
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [fechaInput, setFechaInput] = useState('');
  const [horaInput, setHoraInput] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  // Tipos de entrada (inicia con 1 fila por defecto)
  const [tiposEntrada, setTiposEntrada] = useState([
    { nombre: 'General', descripcion: '', precio: '', cupo: '' },
  ]);

  // Categorías desde el back
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Estados de validación y publicación
  const [publicando, setPublicando] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [descartarModalVisible, setDescartarModalVisible] = useState(false);

  // Carga de categorías canónicas
  useEffect(() => {
    let mounted = true;
    listarCategorias()
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setCategorias(data);
          if (data.length > 0 && !categoriaId) {
            setCategoriaId(data[0].id);
          }
        }
      })
      .catch((err) => {
        if (mounted) setApiError('No se pudieron cargar las categorías: ' + err.message);
      })
      .finally(() => {
        if (mounted) setLoadingCategorias(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Parseo y validación de fecha y hora local
  const { date: fechaParsed, error: fechaError } = parsearFechaHora(fechaInput, horaInput);
  const esFechaPasada = fechaParsed ? fechaParsed <= new Date() : false;
  const fechaPreviewTexto = fechaParsed && !fechaError
    ? formatFecha(fechaParsed.toISOString())
    : null;

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

  // Agregar tipo de entrada (máx 6)
  const handleAgregarTipo = () => {
    if (tiposEntrada.length >= 6) return;
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
      setApiError('La descripción debe tener al menos 5 caracteres.');
      return;
    }
    if (!categoriaId) {
      setApiError('Debés seleccionar una categoría.');
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
        categoria: categoriaId,
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
      {/* Barra superior con botón volver fijo */}
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

          {/* Tarjeta de Datos Básicos */}
          <HardShadow offset={4} borderRadius={12} style={styles.sectionShadow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>DATOS BÁSICOS</Text>

              <PopInput
                label="NOMBRE DEL EVENTO *"
                placeholder="Ej: Quilmes Rock 2027"
                value={nombre}
                onChangeText={setNombre}
                maxLength={70}
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

              {/* Categorías (Chips de selección única) */}
              <Text style={styles.fieldLabel}>CATEGORÍA *</Text>
              <View style={styles.categoriesRow}>
                {categorias.map((cat) => (
                  <FilterChip
                    key={cat.id}
                    label={cat.nombre}
                    selected={categoriaId === cat.id}
                    onPress={() => setCategoriaId(cat.id)}
                  />
                ))}
              </View>
            </View>
          </HardShadow>

          {/* Tarjeta de Fecha y Hora */}
          <HardShadow offset={4} borderRadius={12} style={styles.sectionShadow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>FECHA Y HORA (HORA LOCAL)</Text>

              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeCol}>
                  <PopInput
                    label="FECHA (DD/MM/AAAA) *"
                    placeholder="15/04/2027"
                    value={fechaInput}
                    onChangeText={setFechaInput}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                <View style={styles.dateTimeCol}>
                  <PopInput
                    label="HORA (HH:MM) *"
                    placeholder="21:00"
                    value={horaInput}
                    onChangeText={setHoraInput}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              {/* Vista previa interpretada */}
              {fechaPreviewTexto && (
                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>VISTA PREVIA DE FECHA:</Text>
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

          {/* Tarjeta de Imagen Multimedia */}
          <HardShadow offset={4} borderRadius={12} style={styles.sectionShadow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>PORTADA DEL EVENTO (OPCIONAL)</Text>

              <PopInput
                label="URL DE LA IMAGEN"
                placeholder="https://images.unsplash.com/..."
                value={imagenUrl}
                onChangeText={setImagenUrl}
                autoCapitalize="none"
              />

              {imagenUrl.trim() !== '' && (
                <View style={styles.imagePreviewWrap}>
                  <Text style={styles.previewLabel}>VISTA PREVIA:</Text>
                  <View style={styles.imageBox}>
                    <EventImage uri={imagenUrl.trim()} style={styles.image} />
                  </View>
                </View>
              )}
            </View>
          </HardShadow>

          {/* Tarjeta de Tipos de Entrada */}
          <HardShadow offset={4} borderRadius={12} style={styles.sectionShadow}>
            <View style={styles.sectionCard}>
              <View style={styles.ticketsHeader}>
                <Text style={styles.sectionHeading}>TIPOS DE ENTRADA</Text>
                <Text style={styles.ticketsCountBadge}>{tiposEntrada.length} / 6</Text>
              </View>

              <Text style={styles.sectionSub}>
                Definí al menos una categoría con precio y cupo inicial de tickets.
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

              {tiposEntrada.length < 6 && (
                <PopButton
                  title="+ AGREGAR OTRO TIPO DE ENTRADA"
                  variant="canary"
                  size="md"
                  onPress={handleAgregarTipo}
                  style={styles.addTypeBtn}
                />
              )}
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
  fieldLabel: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
    marginBottom: 8,
    marginTop: 6,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
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
  imagePreviewWrap: {
    marginTop: 10,
  },
  imageBox: {
    height: 140,
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
