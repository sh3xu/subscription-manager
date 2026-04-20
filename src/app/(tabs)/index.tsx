import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SubscriptionCard } from '@/components/subscription/subscription-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { SpendChart } from '@/components/ui/spend-chart';
import { StatCard } from '@/components/ui/stat-card';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMonthlySpend, getProjectedTotals } from '@/lib/billing';
import { formatMoney } from '@/lib/formatters';
import { selectLatestRate, useRatesStore } from '@/store/rates-store';
import { useSettingsStore } from '@/store/settings-store';
import { useSubscriptionsStore } from '@/store/subscriptions-store';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const subscriptions = useSubscriptionsStore((state) => state.items);
  const baseCurrency = useSettingsStore((state) => state.baseCurrency);
  const ratesState = useRatesStore();

  const totals = React.useMemo(
    () =>
      getProjectedTotals(subscriptions, baseCurrency, (currency) =>
        selectLatestRate(ratesState, currency, baseCurrency)
      ),
    [subscriptions, baseCurrency, ratesState]
  );

  const activeSubscriptions = subscriptions.filter((item) => item.status === 'active');
  const currentMonthServiceSpend = React.useMemo(
    () =>
      activeSubscriptions
        .map((subscription) => {
          const nativeMonthly = getMonthlySpend(subscription);
          if (subscription.currency === baseCurrency) {
            return { key: subscription.id, label: subscription.name, value: nativeMonthly };
          }
          const rate = selectLatestRate(ratesState, subscription.currency, baseCurrency);
          if (rate === null) return null;
          return {
            key: subscription.id,
            label: subscription.name,
            value: nativeMonthly * rate,
          };
        })
        .filter(
          (item): item is { key: string; label: string; value: number } =>
            Boolean(item) && item.value > 0
        ),
    [activeSubscriptions, baseCurrency, ratesState]
  );

  const topMonthly = React.useMemo(() => {
    if (!totals.mostExpensive) return null;
    const rate = selectLatestRate(ratesState, totals.mostExpensive.currency, baseCurrency);
    const native = getMonthlySpend(totals.mostExpensive);
    if (totals.mostExpensive.currency === baseCurrency) {
      return formatMoney(native, baseCurrency);
    }
    if (rate === null) {
      return formatMoney(native, totals.mostExpensive.currency);
    }
    return formatMoney(native * rate, baseCurrency);
  }, [totals.mostExpensive, ratesState, baseCurrency]);

  return (
    <Screen>
      <View style={styles.heroHeader}>
        <ThemedText style={styles.heroTitle}>Subscription Tracker</ThemedText>
      </View>

      <Surface tone="accent" padding="lg" bordered>
        <ThemedText type="small" style={{ color: theme.accent, letterSpacing: 1 }}>
          MONTHLY PROJECTION
        </ThemedText>
        <ThemedText style={[styles.bigValue, { color: theme.text }]}>
          {formatMoney(totals.monthlyTotal, baseCurrency)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Across {activeSubscriptions.length}{' '}
          {activeSubscriptions.length === 1 ? 'active subscription' : 'active subscriptions'}
          {totals.missingCurrencies.length
            ? ` · fetching rates for ${totals.missingCurrencies.join(', ')}`
            : ''}
          .
        </ThemedText>
      </Surface>

      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <StatCard label="Yearly" value={formatMoney(totals.yearlyTotal, baseCurrency)} />
        </View>
        <View style={styles.statCell}>
          <StatCard
            label="Top spend"
            value={totals.mostExpensive?.name ?? '—'}
            hint={topMonthly ?? 'Add one to track'}
          />
        </View>
      </View>

      <SpendChart
        title="Current month service spend share"
        subtitle="Percentage split by active subscription"
        currency={baseCurrency}
        data={currentMonthServiceSpend}
      />

      <Section title="Active subscriptions">
        {activeSubscriptions.length ? (
          <View style={styles.list}>
            {activeSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                baseCurrency={baseCurrency}
                onPress={() =>
                  router.push({
                    pathname: '/subscription/[id]',
                    params: { id: subscription.id },
                  })
                }
              />
            ))}
          </View>
        ) : (
          <Surface bordered padding="lg" style={styles.emptyState}>
            <ThemedText type="smallBold">No subscriptions yet</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Add your first subscription to see monthly and yearly projections.
            </ThemedText>
            <Button
              label="Add subscription"
              onPress={() => router.push('/subscription/new')}
            />
          </Surface>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    gap: Spacing.one,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  bigValue: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: Spacing.one,
    marginBottom: Spacing.half,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCell: {
    flex: 1,
  },
  list: {
    gap: Spacing.two,
  },
  emptyState: {
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
});
