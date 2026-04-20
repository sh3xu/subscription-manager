import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SubscriptionForm } from '@/components/subscription/subscription-form';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import {
  cancelForSubscription,
  requestNotificationPermissions,
  scheduleForSubscription,
} from '@/lib/notifications';
import { useSubscriptionsStore } from '@/store/subscriptions-store';
import { SubscriptionInput } from '@/types/subscription';

export default function EditSubscriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const subscriptions = useSubscriptionsStore((state) => state.items);
  const updateSubscriptionById = useSubscriptionsStore((state) => state.updateSubscriptionById);
  const removeSubscription = useSubscriptionsStore((state) => state.removeSubscription);
  const current = subscriptions.find((item) => item.id === id);

  if (!current) {
    return (
      <Screen withTabInset={false}>
        <ThemedText type="subtitle">Not found</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          This subscription no longer exists.
        </ThemedText>
        <Button label="Go back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const onSubmit = async (payload: SubscriptionInput) => {
    try {
      await cancelForSubscription(current);
    } catch {
      // swallow: never block user flow on scheduling failures.
    }

    const updated = await updateSubscriptionById(current.id, payload);

    if (updated) {
      try {
        if (await requestNotificationPermissions()) {
          const notificationIds = await scheduleForSubscription(updated);
          if (notificationIds.length) {
            await updateSubscriptionById(updated.id, { notificationIds });
          }
        }
      } catch {
        // swallow
      }
    }

    router.back();
  };

  const onDelete = async () => {
    try {
      await cancelForSubscription(current);
    } catch {
      // swallow
    }
    await removeSubscription(current.id);
    router.back();
  };

  return (
    <Screen withTabInset={false}>
      <View style={styles.header}>
        <ThemedText type="small" themeColor="textSecondary">
          Update or remove
        </ThemedText>
        <ThemedText style={styles.title}>Edit subscription</ThemedText>
      </View>

      <SubscriptionForm
        submitLabel="Update subscription"
        initialValue={{
          name: current.name,
          amount: String(current.amount),
          currency: current.currency,
          billingCycle: current.billingCycle,
          customCycleDays: String(current.customCycleDays ?? 30),
          startDate: new Date(current.startDate),
          status: current.status,
          serviceKey: current.serviceKey,
          color: current.color,
        }}
        onSubmit={onSubmit}
      />

      <Button label="Delete subscription" variant="danger" onPress={onDelete} />
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
});
