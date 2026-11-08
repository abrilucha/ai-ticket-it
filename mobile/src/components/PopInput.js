import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';

/**
 * PopInput
 * Campo de texto estilizado estilo viñeta Pop Art con etiqueta y soporte de errores.
 */
export function PopInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputContainerError : null,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            multiline && { minHeight: numberOfLines * 24 },
            inputStyle,
          ]}
        />
      </View>
      {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...Typography.labelMd,
    color: Colors.inkBlack,
    marginBottom: 6,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputContainerError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorContainer,
  },
  input: {
    ...Typography.bodyLg,
    color: Colors.inkBlack,
    padding: 0,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Colors.error,
    marginTop: 4,
  },
});
