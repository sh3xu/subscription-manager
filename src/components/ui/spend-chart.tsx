import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

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

const PIE_SIZE = 168;
const PIE_STROKE = 22;
const PIE_RADIUS = (PIE_SIZE - PIE_STROKE) / 2;
const PIE_CIRCUMFERENCE = 2 * Math.PI * PIE_RADIUS;
const SEGMENT_COLORS = ['#6366F1', '#06B6D4', '#14B8A6', '#22C55E', '#F59E0B', '#EF4444'];

export function SpendChart({ title, subtitle, currency, data }: SpendChartProps) {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

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

      <View style={styles.content}>
        <View style={styles.pieWrap}>
          <Svg width={PIE_SIZE} height={PIE_SIZE}>
            <Circle
              cx={PIE_SIZE / 2}
              cy={PIE_SIZE / 2}
              r={PIE_RADIUS}
              stroke={theme.border}
              strokeWidth={PIE_STROKE}
              fill="none"
            />
            {data.map((item, index) => {
              const ratio = total === 0 ? 0 : item.value / total;
              const strokeDasharray = `${ratio * PIE_CIRCUMFERENCE} ${PIE_CIRCUMFERENCE}`;
              const strokeDashoffset = -offset;
              offset += ratio * PIE_CIRCUMFERENCE;
              return (
                <Circle
                  key={item.label}
                  cx={PIE_SIZE / 2}
                  cy={PIE_SIZE / 2}
                  r={PIE_RADIUS}
                  stroke={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                  strokeWidth={PIE_STROKE}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  fill="none"
                  transform={`rotate(-90 ${PIE_SIZE / 2} ${PIE_SIZE / 2})`}
                />
              );
            })}
          </Svg>
          <View style={styles.centerLabel}>
            <ThemedText type="small" themeColor="textSecondary">
              Total
            </ThemedText>
            <ThemedText type="smallBold">{formatMoney(total, currency)}</ThemedText>
          </View>
        </View>

        <View style={styles.legend}>
          {data.map((item, index) => {
            const ratio = total === 0 ? 0 : (item.value / total) * 100;
            return (
              <View key={item.label} style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] },
                  ]}
                />
                <View style={styles.legendText}>
                  <ThemedText type="smallBold">{item.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatMoney(item.value, currency)} ({ratio.toFixed(1)}%)
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.half,
  },
  content: {
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  pieWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    gap: Spacing.half,
  },
  legend: {
    gap: Spacing.one,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
  },
});
