import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBarHeight, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  edges?: readonly Edge[];
  withTabInset?: boolean;
  footer?: React.ReactNode;
};

export function Screen({
  children,
  scroll = true,
  contentStyle,
  edges,
  withTabInset = true,
  footer,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = withTabInset
    ? BottomTabBarHeight + insets.bottom + Spacing.three
    : Spacing.four;

  const body = (
    <View style={[styles.body, { paddingBottom: bottomPad }, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={edges ?? ['top', 'left', 'right']}
      style={[styles.root, { backgroundColor: theme.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={styles.fill}>{body}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
    alignSelf: 'center',
  },
});
