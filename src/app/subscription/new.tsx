import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ServicePicker } from '@/components/subscription/service-picker';
import { SubscriptionForm } from '@/components/subscription/subscription-form';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { SERVICE_PRESETS } from '@/constants/services';
import { Spacing } from '@/constants/theme';
import { requestNotificationPermissions, scheduleForSubscription } from '@/lib/notifications';
import { useSubscriptionsStore } from '@/store/subscriptions-store';
import { SubscriptionInput } from '@/types/subscription';

export default function NewSubscriptionScreen() {
  const addSubscription = useSubscriptionsStore((state) => state.addSubscription);
  const updateSubscriptionById = useSubscriptionsStore((state) => state.updateSubscriptionById);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);

  const preset = SERVICE_PRESETS.find((item) => item.key === selectedService);

  const handleSubmit = async (payload: SubscriptionInput) => {
    const created = await addSubscription({
      ...payload,
      serviceKey: selectedService,
      name: payload.name || preset?.name || '',
      currency: payload.currency || preset?.currencyHint || 'INR',
      amount: payload.amount || preset?.amountHint || 0,
    });

    // NOTE: notifications are best-effort; never block navigation if scheduling fails.
    if (created) {
      try {
        if (await requestNotificationPermissions()) {
          const notificationIds = await scheduleForSubscription(created);
          if (notificationIds.length) {
            await updateSubscriptionById(created.id, { notificationIds });
          }
        }
      } catch {
        // swallow
      }
    }

    router.back();
  };

  return (
    <Screen withTabInset={false}>
      <View style={styles.header}>
        <ThemedText type="small" themeColor="textSecondary">
          Track a new recurring charge
        </ThemedText>
        <ThemedText style={styles.title}>Add subscription</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Popular services</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Tap one to prefill, or add manually below.
        </ThemedText>
        <ServicePicker
          selectedKey={selectedService}
          onSelect={(service) =>
            setSelectedService((prev) => (prev === service.key ? null : service.key))
          }
        />
      </View>

      <SubscriptionForm
        key={selectedService ?? 'manual'}
        submitLabel="Save subscription"
        initialValue={
          preset
            ? {
                name: preset.name,
                amount: String(preset.amountHint),
                currency: preset.currencyHint,
                serviceKey: preset.key,
              }
            : undefined
        }
        onSubmit={handleSubmit}
      />
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
  section: {
    gap: Spacing.two,
  },
});
