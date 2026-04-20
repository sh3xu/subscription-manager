import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type SectionProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  gap?: number;
};

export function Section({ title, description, action, children, gap }: SectionProps) {
  return (
    <View style={[styles.container, gap !== undefined && { gap }]}>
      {(title || action) && (
        <View style={styles.header}>
          {title ? <ThemedText type="smallBold">{title}</ThemedText> : <View />}
          {action}
        </View>
      )}
      {description && (
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
