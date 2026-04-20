import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  leading,
  trailing,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const palette = React.useMemo(() => {
    switch (variant) {
      case 'primary':
        return { bg: theme.accent, color: theme.accentText, border: 'transparent' };
      case 'secondary':
        return { bg: theme.surface, color: theme.text, border: theme.border };
      case 'ghost':
        return { bg: 'transparent', color: theme.accent, border: 'transparent' };
      case 'danger':
        return { bg: theme.dangerSoft, color: theme.danger, border: 'transparent' };
    }
  }, [variant, theme]);

  const minHeight = size === 'lg' ? 56 : size === 'sm' ? 40 : 48;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      accessibilityRole="button">
      {loading ? (
        <ActivityIndicator color={palette.color} size="small" />
      ) : (
        <View style={styles.row}>
          {leading}
          <ThemedText type="smallBold" style={[styles.label, { color: palette.color }]}>
            {label}
          </ThemedText>
          {trailing}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  label: { fontSize: 15 },
});
