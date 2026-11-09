import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * QuantityStepper
 * Selector de cantidad con botones - y + en estilo Pop Art.
 * Respeta un mínimo de 1 y un máximo configurable según cupoRestante.
 */
export function QuantityStepper({ value = 1, min = 1, max = 10, onChange, disabled = false }) {
  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onChange(value - 1);
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange(value + 1);
  };

  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;

  return (
    <View style={styles.container}>
      {/* Botón Decrementar */}
      <HardShadow offset={canDecrement ? 2 : 0} borderRadius={8}>
        <Pressable
          onPress={handleDecrement}
          disabled={!canDecrement}
          style={[
            styles.btn,
            !canDecrement && styles.btnDisabled,
          ]}
          hitSlop={8}
        >
          <Text style={[styles.btnText, !canDecrement && styles.textDisabled]}>−</Text>
        </Pressable>
      </HardShadow>

      {/* Valor central */}
      <View style={styles.valueBox}>
        <Text style={styles.valueText}>{value}</Text>
      </View>

      {/* Botón Incrementar */}
      <HardShadow offset={canIncrement ? 2 : 0} borderRadius={8}>
        <Pressable
          onPress={handleIncrement}
          disabled={!canIncrement}
          style={[
            styles.btn,
            !canIncrement && styles.btnDisabled,
          ]}
          hitSlop={8}
        >
          <Text style={[styles.btnText, !canIncrement && styles.textDisabled]}>+</Text>
        </Pressable>
      </HardShadow>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: Colors.surfaceDim,
    borderColor: Colors.outline,
  },
  btnText: {
    ...Typography.titleLg,
    color: Colors.inkBlack,
    lineHeight: 22,
  },
  textDisabled: {
    color: Colors.outline,
  },
  valueBox: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  valueText: {
    ...Typography.headlineMd,
    color: Colors.inkBlack,
  },
});
