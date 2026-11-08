import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * SearchBar
 * Barra de búsqueda con estilo de viñeta de cómic, debounce configurable de 400ms
 * y botón para limpiar el texto.
 */
export function SearchBar({
  value,
  onDebouncedChange,
  placeholder = 'Buscar recitales, obras, festivales...',
  style,
}) {
  const [inputText, setInputText] = useState(value || '');
  const timerRef = useRef(null);

  // Sincronizar si cambia el valor externo
  useEffect(() => {
    setInputText(value || '');
  }, [value]);

  // Limpiar timer de debounce al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (text) => {
    setInputText(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onDebouncedChange(text);
    }, 400);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputText('');
    onDebouncedChange('');
  };

  return (
    <HardShadow offset={3} borderRadius={10} style={[styles.wrapper, style]}>
      <View style={styles.container}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={inputText}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline}
          returnKeyType="search"
          style={styles.input}
        />
        {inputText.length > 0 ? (
          <Pressable onPress={handleClear} style={styles.clearBtn} hitSlop={8}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    ...Typography.bodyLg,
    color: Colors.inkBlack,
    flex: 1,
    paddingVertical: 0,
  },
  clearBtn: {
    backgroundColor: Colors.surfaceDim,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.inkBlack,
    marginLeft: 6,
  },
  clearText: {
    ...Typography.labelSm,
    color: Colors.inkBlack,
  },
});
