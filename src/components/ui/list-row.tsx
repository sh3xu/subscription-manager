import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';

type ListRowProps = {
  leading?: React.ReactNode;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
};

export function ListRow({ leading, children, trailing, onPress }: ListRowProps) {
  const content = (
    <Surface bordered padding="md" style={styles.row}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.body}>{children}</View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Surface>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  leading: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: Spacing.half,
  },
});
