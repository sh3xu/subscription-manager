import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AvatarDot } from '@/components/ui/avatar-dot';
import { ListRow } from '@/components/ui/list-row';
import { formatDate, formatMoney } from '@/lib/formatters';
import { selectLatestRate, useRatesStore } from '@/store/rates-store';
import { TimelineCharge } from '@/types/subscription';

type TimelineItemProps = {
  charge: TimelineCharge;
  baseCurrency: string;
};

export function TimelineItem({ charge, baseCurrency }: TimelineItemProps) {
  // NOTE: timeline only contains upcoming charges, so latest rate is the right lookup.
  const rate = useRatesStore((state) => selectLatestRate(state, charge.currency, baseCurrency));
  const showConverted = charge.currency !== baseCurrency && rate !== null;
  const converted = showConverted ? charge.amount * rate! : null;

  return (
    <ListRow
      leading={<AvatarDot label={charge.subscriptionName} />}
      trailing={
        <View style={styles.trailing}>
          <ThemedText type="smallBold">
            {formatMoney(charge.amount, charge.currency)}
          </ThemedText>
          {converted !== null ? (
            <ThemedText type="small" themeColor="textSecondary">
              ≈ {formatMoney(converted, baseCurrency)}
            </ThemedText>
          ) : null}
        </View>
      }>
      <ThemedText type="smallBold" numberOfLines={1}>
        {charge.subscriptionName}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatDate(charge.date)}
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
