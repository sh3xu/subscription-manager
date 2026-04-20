import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  emphasized?: boolean;
};

export function StatCard({ label, value, hint, emphasized }: StatCardProps) {
  const theme = useTheme();
  return (
    <Surface tone={emphasized ? 'accent' : 'surface'} bordered padding="md">
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={styles.valueRow}>
        <ThemedText
          style={[
            styles.value,
            { color: emphasized ? theme.accent : theme.text },
          ]}
          numberOfLines={1}>
          {value}
        </ThemedText>
      </View>
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  valueRow: {
    marginTop: Spacing.one,
    marginBottom: Spacing.half,
  },
  value: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
