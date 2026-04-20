import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps } from 'expo-router/ui';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  iconName: React.ComponentProps<typeof Icon>['name'];
  activeColor: string;
  inactiveColor: string;
  focusedBackgroundColor: string;
};

function TabButton({
  label,
  iconName,
  isFocused,
  activeColor,
  inactiveColor,
  focusedBackgroundColor,
  ...props
}: TabButtonProps) {
  const labelColor = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabButtonView,
        pressed && styles.pressed,
        isFocused ? { backgroundColor: focusedBackgroundColor } : undefined,
      ]}>
      <Icon name={iconName} size={16} color={isFocused ? activeColor : inactiveColor} />
      <ThemedText type="small" style={{ color: labelColor }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
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
            label="Home"
            iconName="House"
            activeColor={colors.accent}
            inactiveColor={colors.textSecondary}
            focusedBackgroundColor={colors.backgroundSelected}
          />
        </TabTrigger>
        <TabTrigger name="timeline" href="/(tabs)/timeline" asChild>
          <TabButton
            label="Timeline"
            iconName="Clock3"
            activeColor={colors.accent}
            inactiveColor={colors.textSecondary}
            focusedBackgroundColor={colors.backgroundSelected}
          />
        </TabTrigger>
        <TabTrigger name="settings" href="/(tabs)/settings" asChild>
          <TabButton
            label="Settings"
            iconName="Settings"
            activeColor={colors.accent}
            inactiveColor={colors.textSecondary}
            focusedBackgroundColor={colors.backgroundSelected}
          />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
  tabButtonView: {
    minWidth: 90,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
