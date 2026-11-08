import React, { useState } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * PopButton
 * Botón interactivo con estética Pop Kinetic: bordes negros gruesos,
 * sombra dura desplazada y animación mecánica de compresión al presionar.
 */
export function PopButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'canary'
  loading = false,
  disabled = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  offset = 3,
  borderRadius = 10,
  style,
}) {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantStyles = () => {
    if (disabled) {
      return {
        bg: Colors.surfaceDim,
        text: Colors.outline,
        border: Colors.outline,
      };
    }
    switch (variant) {
      case 'secondary':
        return {
          bg: Colors.canvasTint,
          text: Colors.inkBlack,
          border: Colors.inkBlack,
        };
      case 'danger':
        return {
          bg: Colors.popVermilion,
          text: Colors.white,
          border: Colors.inkBlack,
        };
      case 'canary':
        return {
          bg: Colors.canaryYellow,
          text: Colors.inkBlack,
          border: Colors.inkBlack,
        };
      case 'primary':
      default:
        return {
          bg: Colors.electricCobalt,
          text: Colors.white,
          border: Colors.inkBlack,
        };
    }
  };

  const colors = getVariantStyles();

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, textStyle: Typography.labelMd },
    md: { paddingVertical: 12, paddingHorizontal: 20, textStyle: Typography.labelLg },
    lg: { paddingVertical: 16, paddingHorizontal: 24, textStyle: Typography.titleMd },
  }[size] || { paddingVertical: 12, paddingHorizontal: 20, textStyle: Typography.labelLg };

  return (
    <HardShadow
      offset={disabled ? 0 : offset}
      borderRadius={borderRadius}
      isPressed={isPressed}
      style={style}
    >
      <Pressable
        onPress={disabled || loading ? null : onPress}
        onPressIn={() => !disabled && !loading && setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[
          styles.buttonBody,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderRadius,
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
            <Text style={[sizeStyles.textStyle, { color: colors.text }]}>
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  buttonBody: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    marginRight: 8,
  },
});
