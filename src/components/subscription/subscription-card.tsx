import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AvatarDot } from '@/components/ui/avatar-dot';
import { ListRow } from '@/components/ui/list-row';
import { getNextBillingDate } from '@/lib/billing';
import { formatMoney } from '@/lib/formatters';
import { selectLatestRate, useRatesStore } from '@/store/rates-store';
import { Subscription } from '@/types/subscription';

function daysUntilDate(target: Date): number {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((startTarget - startToday) / (1000 * 60 * 60 * 24));
}

type SubscriptionCardProps = {
  subscription: Subscription;
  baseCurrency: string;
  onPress?: () => void;
};

export function SubscriptionCard({
  subscription,
  baseCurrency,
  onPress,
}: SubscriptionCardProps) {
  const nextBilling = getNextBillingDate(subscription);
  const days = daysUntilDate(nextBilling);
  const subtitle =
    subscription.status !== 'active'
      ? subscription.status === 'paused'
        ? 'Paused'
        : 'Cancelled'
      : days <= 0
        ? 'Billing today'
        : days === 1
          ? 'Renews tomorrow'
          : `Renews in ${days} days`;

  // NOTE: latest rate applies because the trailing amount reflects the upcoming charge.
  const rate = useRatesStore((state) =>
    selectLatestRate(state, subscription.currency, baseCurrency)
  );
  const showConverted = subscription.currency !== baseCurrency && rate !== null;
  const convertedAmount = showConverted ? subscription.amount * rate! : null;

  return (
    <ListRow
      onPress={onPress}
      leading={<AvatarDot label={subscription.name} color={subscription.color} />}
      trailing={
        <View style={styles.trailing}>
          <ThemedText type="smallBold">
            {formatMoney(subscription.amount, subscription.currency)}
          </ThemedText>
          {showConverted && convertedAmount !== null ? (
            <ThemedText type="small" themeColor="textSecondary">
              ≈ {formatMoney(convertedAmount, baseCurrency)}
            </ThemedText>
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              {subscription.billingCycle}
            </ThemedText>
          )}
        </View>
      }>
      <ThemedText type="smallBold" numberOfLines={1}>
        {subscription.name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {subtitle}
      </ThemedText>
    </ListRow>
  );
}

const styles = StyleSheet.create({
  trailing: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
