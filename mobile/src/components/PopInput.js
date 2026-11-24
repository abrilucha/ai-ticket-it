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
  isPink = false,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoComplete,
  rightComponent,
  style,
  inputStyle,
  onLayout,
  inputRef,
}) {
  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isPink || error ? styles.inputContainerPink : null,
          rightComponent ? styles.inputContainerWithRight : null,
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          style={[
            styles.input,
            multiline && { minHeight: numberOfLines * 24 },
            rightComponent ? { flex: 1 } : null,
            inputStyle,
          ]}
        />
        {rightComponent}
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
  inputContainerWithRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerPink: {
    backgroundColor: '#FFE4E6',
    borderColor: '#F43F5E',
  },
  inputContainerError: {
    backgroundColor: '#FFE4E6',
    borderColor: '#F43F5E',
  },
  input: {
    ...Typography.bodyLg,
    color: Colors.inkBlack,
    padding: 0,
  },
  errorText: {
    ...Typography.bodyMd,
    color: '#E11D48',
    fontWeight: '700',
    marginTop: 4,
  },
});
