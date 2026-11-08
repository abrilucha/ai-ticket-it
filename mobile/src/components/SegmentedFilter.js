import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * SegmentedFilter
 * Selector de pestañas segmentadas Pop Art para filtrar entre "Activas" e "Historial".
 */
export function SegmentedFilter({ selectedTab = 'ACTIVAS', onSelect, counts = {}, style }) {
  const isActivas = selectedTab === 'ACTIVAS';

  return (
    <View style={[styles.container, style]}>
      {/* Botón ACTIVAS */}
      <View style={styles.segmentWrapper}>
        <HardShadow offset={isActivas ? 1 : 2} borderRadius={8}>
          <Pressable
            onPress={() => onSelect('ACTIVAS')}
            style={[
              styles.segmentBtn,
              {
                backgroundColor: isActivas ? Colors.electricCobalt : Colors.white,
              },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: isActivas ? Colors.white : Colors.inkBlack },
              ]}
            >
              ACTIVAS {counts.activas !== undefined ? `(${counts.activas})` : ''}
            </Text>
          </Pressable>
        </HardShadow>
      </View>

      {/* Botón HISTORIAL */}
      <View style={styles.segmentWrapper}>
        <HardShadow offset={!isActivas ? 1 : 2} borderRadius={8}>
          <Pressable
            onPress={() => onSelect('HISTORIAL')}
            style={[
              styles.segmentBtn,
              {
                backgroundColor: !isActivas ? Colors.electricCobalt : Colors.white,
              },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: !isActivas ? Colors.white : Colors.inkBlack },
              ]}
            >
              HISTORIAL {counts.historial !== undefined ? `(${counts.historial})` : ''}
            </Text>
          </Pressable>
        </HardShadow>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  segmentWrapper: {
    flex: 1,
  },
  segmentBtn: {
    borderWidth: 2,
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    ...Typography.labelSm,
    fontWeight: '700',
  },
});
