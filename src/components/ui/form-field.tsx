import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export function FormField({ label, hint, error, children }: FormFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {label ? <ThemedText type="smallBold">{label}</ThemedText> : null}
      {children}
      {error ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
});
