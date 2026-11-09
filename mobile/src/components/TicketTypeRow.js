import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';
import { PopInput } from './PopInput.js';
import { PopButton } from './PopButton.js';

/**
 * TicketTypeRow
 * Fila dinámica editable para definir un tipo de entrada en la creación de eventos.
 */
export function TicketTypeRow({
  item,
  index,
  totalRows,
  onChange,
  onRemove,
  isDuplicateName = false,
  errorNombre = null,
  errorPrecio = null,
  errorCupo = null,
}) {
  return (
    <HardShadow offset={3} borderRadius={10} style={styles.cardShadow}>
      <View style={[styles.card, isDuplicateName && styles.cardDuplicate]}>
        {/* Cabecera de la fila con título y botón para quitar */}
        <View style={styles.headerRow}>
          <Text style={styles.indexTitle}>TIPO DE ENTRADA #{index + 1}</Text>
          {totalRows > 1 && (
            <PopButton
              title="✕ QUITAR"
              variant="danger"
              size="sm"
              onPress={() => onRemove(index)}
              style={styles.removeBtn}
            />
          )}
        </View>

        {isDuplicateName && (
          <View style={styles.duplicateWarning}>
            <Text style={styles.duplicateWarningText}>
              ⚠️ Ya existe otro tipo de entrada con este mismo nombre.
            </Text>
          </View>
        )}

        {/* Nombre del tipo */}
        <PopInput
          label="NOMBRE DEL TIPO *"
          placeholder="Ej: Campo General, Platea VIP, Pullman"
          value={item.nombre}
          onChangeText={(val) => onChange(index, 'nombre', val)}
          error={errorNombre}
          maxLength={40}
        />

        {/* Descripción corta opcional */}
        <PopInput
          label="DESCRIPCIÓN (OPCIONAL)"
          placeholder="Ej: Acceso preferencial, incluye consumición"
          value={item.descripcion}
          onChangeText={(val) => onChange(index, 'descripcion', val)}
          maxLength={80}
        />

        {/* Fila con Precio y Cupo */}
        <View style={styles.numberInputsRow}>
          <View style={styles.numberInputCol}>
            <PopInput
              label="PRECIO ($) *"
              placeholder="0"
              keyboardType="numeric"
              value={item.precio !== undefined && item.precio !== null ? String(item.precio) : ''}
              onChangeText={(val) => {
                const clean = val.replace(/[^0-9]/g, '');
                onChange(index, 'precio', clean);
              }}
              error={errorPrecio}
            />
          </View>
          <View style={styles.numberInputCol}>
            <PopInput
              label="CUPO INICIAL *"
              placeholder="100"
              keyboardType="numeric"
              value={item.cupo !== undefined && item.cupo !== null ? String(item.cupo) : ''}
              onChangeText={(val) => {
                const clean = val.replace(/[^0-9]/g, '');
                onChange(index, 'cupo', clean);
              }}
              error={errorCupo}
            />
          </View>
        </View>
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.canvasTint,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    padding: 14,
  },
  cardDuplicate: {
    borderColor: Colors.crimsonPunch,
    backgroundColor: '#FFF0F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  indexTitle: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  duplicateWarning: {
    backgroundColor: '#FFE6E6',
    borderWidth: 1.5,
    borderColor: Colors.crimsonPunch,
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  duplicateWarningText: {
    ...Typography.bodySm,
    color: Colors.crimsonPunch,
    fontWeight: '700',
  },
  numberInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  numberInputCol: {
    flex: 1,
  },
});
