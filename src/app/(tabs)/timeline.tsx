import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { TimelineItem } from '@/components/subscription/timeline-item';
import { ThemedText } from '@/components/themed-text';
import { Fab } from '@/components/ui/fab';
import { Screen } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { generateTimeline } from '@/lib/billing';
import { useSettingsStore } from '@/store/settings-store';
import { useSubscriptionsStore } from '@/store/subscriptions-store';

export default function TimelineScreen() {
  const router = useRouter();
  const subscriptions = useSubscriptionsStore((state) => state.items);
  const baseCurrency = useSettingsStore((state) => state.baseCurrency);
  const timeline = generateTimeline(subscriptions, 60);

  return (
    <Screen
      footer={<Fab label="Add subscription" onPress={() => router.push('/subscription/new')} />}>
      <View style={styles.header}>
        <ThemedText type="small" themeColor="textSecondary">
          Next 60 days
        </ThemedText>
        <ThemedText style={styles.title}>Upcoming charges</ThemedText>
      </View>

      <Section
        description={
          timeline.length
            ? `${timeline.length} upcoming ${timeline.length === 1 ? 'charge' : 'charges'} across your active subscriptions.`
            : undefined
        }>
        {timeline.length ? (
          <View style={styles.list}>
            {timeline.map((charge, index) => (
              <TimelineItem
                key={`${charge.subscriptionId}-${index}`}
                charge={charge}
                baseCurrency={baseCurrency}
              />
            ))}
          </View>
        ) : (
          <Surface bordered padding="lg" style={styles.empty}>
            <ThemedText type="smallBold">All clear</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              No scheduled charges in the next 60 days.
            </ThemedText>
          </Surface>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  list: {
    gap: Spacing.two,
  },
  empty: {
    gap: Spacing.two,
  },
});
