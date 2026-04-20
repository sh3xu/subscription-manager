import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  size?: 'sm' | 'md';
};

export function Chip({ label, selected, onPress, style, size = 'md' }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        {
          backgroundColor: selected ? theme.accent : theme.surface,
          borderColor: selected ? theme.accent : theme.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <ThemedText
        type="smallBold"
        style={{ color: selected ? theme.accentText : theme.text }}
        numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sm: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});
