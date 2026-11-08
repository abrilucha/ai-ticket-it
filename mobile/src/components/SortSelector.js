import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

const OPCIONES = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'precio', label: 'Precio' },
  { key: 'puntaje', label: 'Puntaje' },
];

/**
 * SortSelector
 * Control Pop Art para ordenar por Fecha, Precio o Puntaje, con alternancia Asc/Desc.
 * Por defecto: fecha asc. Al elegir puntaje: inicia en desc.
 */
export function SortSelector({ orden = 'fecha', direccion = 'asc', onChange, style }) {
  const handleSelect = (key) => {
    if (orden === key) {
      // Alternar dirección
      const nuevaDir = direccion === 'asc' ? 'desc' : 'asc';
      onChange(key, nuevaDir);
    } else {
      // Cambio de opción: puntaje inicia en desc, fecha/precio en asc
      const dirInicial = key === 'puntaje' ? 'desc' : 'asc';
      onChange(key, dirInicial);
    }
  };

  const getDireccionFlecha = (key) => {
    if (orden !== key) return '';
    return direccion === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>ORDENAR POR:</Text>
      <View style={styles.buttonsRow}>
        {OPCIONES.map((op) => {
          const isActive = orden === op.key;
          return (
            <HardShadow
              key={op.key}
              offset={isActive ? 1 : 2}
              borderRadius={6}
              style={styles.shadowBtn}
            >
              <Pressable
                onPress={() => handleSelect(op.key)}
                style={[
                  styles.btn,
                  {
                    backgroundColor: isActive ? Colors.canaryYellow : Colors.white,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: Colors.inkBlack,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {op.label}
                  {getDireccionFlecha(op.key)}
                </Text>
              </Pressable>
            </HardShadow>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shadowBtn: {
    marginRight: 6,
    marginBottom: 6,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    ...Typography.labelSm,
  },
});
