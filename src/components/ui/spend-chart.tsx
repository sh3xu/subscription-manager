import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/lib/formatters';

type SpendChartDatum = {
  label: string;
  value: number;
};

type SpendChartProps = {
  title: string;
  subtitle?: string;
  currency: string;
  data: SpendChartDatum[];
};

const BAR_MAX_HEIGHT = 120;

export function SpendChart({ title, subtitle, currency, data }: SpendChartProps) {
  const theme = useTheme();
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  return (
    <Surface bordered padding="md">
      <View style={styles.header}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.barsRow}>
        {data.map((item) => {
          const ratio = maxValue === 0 ? 0 : item.value / maxValue;
          const height = Math.max(4, Math.round(ratio * BAR_MAX_HEIGHT));
          return (
            <View key={item.label} style={styles.barCell}>
              <ThemedText type="small" style={styles.valueLabel} numberOfLines={1}>
                {formatMoney(item.value, currency)}
              </ThemedText>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: ratio === 0 ? theme.border : theme.accent,
                  },
                ]}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {item.label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.half,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.one,
    marginTop: Spacing.three,
  },
  barCell: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  valueLabel: {
    fontSize: 11,
  },
  bar: {
    width: '80%',
    minHeight: 4,
    borderRadius: 8,
  },
});
