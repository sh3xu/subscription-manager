import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { SERVICE_PRESETS, ServicePreset } from '@/constants/services';
import { Spacing } from '@/constants/theme';

type ServicePickerProps = {
  selectedKey: string | null;
  onSelect: (service: ServicePreset) => void;
};

export function ServicePicker({ selectedKey, onSelect }: ServicePickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {SERVICE_PRESETS.map((service) => (
        <Chip
          key={service.key}
          label={service.name}
          selected={selectedKey === service.key}
          onPress={() => onSelect(service)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.one,
    paddingHorizontal: 2,
  },
});
