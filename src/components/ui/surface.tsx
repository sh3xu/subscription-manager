import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SurfaceTone = 'surface' | 'raised' | 'accent' | 'danger' | 'transparent';

type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';

type SurfaceProps = ViewProps & {
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  radius?: keyof typeof Radius;
  bordered?: boolean;
};

const PADDING_MAP: Record<SurfacePadding, number> = {
  none: 0,
  sm: Spacing.two,
  md: Spacing.three,
  lg: Spacing.four,
};

export function Surface({
  tone = 'surface',
  padding = 'none',
  radius = 'lg',
  bordered = false,
  style,
  ...rest
}: SurfaceProps) {
  const theme = useTheme();

  const backgroundColor =
    tone === 'transparent'
      ? 'transparent'
      : tone === 'accent'
        ? theme.accentSoft
        : tone === 'danger'
          ? theme.dangerSoft
          : tone === 'raised'
            ? theme.surfaceRaised
            : theme.surface;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderRadius: Radius[radius],
          padding: PADDING_MAP[padding],
          borderColor: theme.border,
          borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
