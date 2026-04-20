import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps
} from 'expo-router/ui';
import React from 'react';
import { Pressable, useColorScheme, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from './themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList
        style={[
          styles.tabListContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom, Spacing.two),
          },
        ]}>
        <TabTrigger name="index" href="/(tabs)" asChild>
          <TabButton
            iconName="House"
            color={colors.accent}
            focusedBackgroundColor={colors.backgroundSelected}>
            Home
          </TabButton>
        </TabTrigger>
        <TabTrigger name="timeline" href="/(tabs)/timeline" asChild>
          <TabButton
            iconName="Clock3"
            color={colors.accent}
            focusedBackgroundColor={colors.backgroundSelected}>
            Timeline
          </TabButton>
        </TabTrigger>
        <TabTrigger name="settings" href="/(tabs)/settings" asChild>
          <TabButton
            iconName="Settings"
            color={colors.accent}
            focusedBackgroundColor={colors.backgroundSelected}>
            Settings
          </TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  iconName: React.ComponentProps<typeof Icon>['name'];
  color: string;
  focusedBackgroundColor: string;
};

export function TabButton({
  children,
  iconName,
  color,
  focusedBackgroundColor,
  isFocused,
  ...props
}: TabButtonProps) {
  const labelColor = isFocused ? color : '#8A93A7';

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabButtonView,
        pressed && styles.pressed,
        isFocused ? { backgroundColor: focusedBackgroundColor } : undefined,
      ]}>
        <Icon name={iconName} size={16} color={isFocused ? color : '#8A93A7'} />
        <ThemedText type="small" style={{ color: labelColor }}>
          {children}
        </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    minWidth: 90,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.half,
  },
});
