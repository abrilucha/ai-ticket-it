import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors.js';
import { Typography } from '../theme/typography.js';
import { HardShadow } from './HardShadow.js';

/**
 * SegmentedFilter
 * Selector de pestañas segmentadas Pop Art para filtrar entre "Activas" e "Historial".
 */
export function SegmentedFilter({
  selectedTab = 'ACTIVAS',
  onSelect,
  options,
  counts = {},
  style,
}) {
  const tabs = options || [
    { id: 'ACTIVAS', label: 'ACTIVAS' },
    { id: 'HISTORIAL', label: 'HISTORIAL' },
  ];

  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab.id;
        const countText = counts[tab.id.toLowerCase()] !== undefined ? ` (${counts[tab.id.toLowerCase()]})` : '';
        return (
          <View key={tab.id} style={styles.segmentWrapper}>
            <HardShadow offset={isSelected ? 1 : 2} borderRadius={8}>
              <Pressable
                onPress={() => onSelect(tab.id)}
                style={[
                  styles.segmentBtn,
                  {
                    backgroundColor: isSelected ? Colors.electricCobalt : Colors.white,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: isSelected ? Colors.white : Colors.inkBlack },
                  ]}
                >
                  {tab.label || tab.id}{countText}
                </Text>
              </Pressable>
            </HardShadow>
          </View>
        );
      })}
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
