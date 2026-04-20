import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { CurrencySelect } from '@/components/ui/currency-select';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BillingCycle, SubscriptionInput, SubscriptionStatus } from '@/types/subscription';

type FormValue = {
  name: string;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  customCycleDays: string;
  startDate: Date;
  status: SubscriptionStatus;
  serviceKey: string | null;
  color: string | null;
};

type SubscriptionFormProps = {
  initialValue?: Partial<FormValue>;
  submitLabel: string;
  onSubmit: (value: SubscriptionInput) => Promise<void> | void;
};

type FieldErrors = Partial<Record<'name' | 'amount' | 'customCycleDays', string>>;

const cycleOptions: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

export function SubscriptionForm({ initialValue, onSubmit, submitLabel }: SubscriptionFormProps) {
  const theme = useTheme();
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [datePickerVisible, setDatePickerVisible] = React.useState(false);
  const [form, setForm] = React.useState<FormValue>({
    name: initialValue?.name ?? '',
    amount: initialValue?.amount ?? '',
    currency: initialValue?.currency ?? 'INR',
    billingCycle: initialValue?.billingCycle ?? 'monthly',
    customCycleDays: initialValue?.customCycleDays ?? '30',
    startDate: initialValue?.startDate ?? new Date(),
    status: initialValue?.status ?? 'active',
    serviceKey: initialValue?.serviceKey ?? null,
    color: initialValue?.color ?? null,
  });

  const clearError = (key: keyof FieldErrors) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setDatePickerVisible(false);
    if (date) setForm((prev) => ({ ...prev, startDate: date }));
  };

  const submit = async () => {
    const name = form.name.trim();
    const parsedAmount = Number(form.amount);
    const nextErrors: FieldErrors = {};

    if (!name) nextErrors.name = 'Enter a subscription name.';
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0)
      nextErrors.amount = 'Enter a valid amount greater than zero.';
    if (form.billingCycle === 'custom') {
      const cycleDays = Number(form.customCycleDays);
      if (!Number.isFinite(cycleDays) || cycleDays <= 0)
        nextErrors.customCycleDays = 'Enter a valid number of days.';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        amount: parsedAmount,
        currency: form.currency,
        billingCycle: form.billingCycle,
        customCycleDays: form.billingCycle === 'custom' ? Number(form.customCycleDays) : null,
        startDate: form.startDate.toISOString(),
        status: form.status,
        serviceKey: form.serviceKey,
        color: form.color,
        notificationIds: [],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <FormField label="Name" error={errors.name}>
        <Input
          value={form.name}
          onChangeText={(name) => {
            clearError('name');
            setForm((prev) => ({ ...prev, name }));
          }}
          placeholder="Netflix, Spotify, iCloud..."
          error={Boolean(errors.name)}
        />
      </FormField>

      <FormField label="Amount" error={errors.amount}>
        <Input
          value={form.amount}
          onChangeText={(amount) => {
            clearError('amount');
            setForm((prev) => ({ ...prev, amount }));
          }}
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={Boolean(errors.amount)}
        />
      </FormField>

      <FormField
        label="Currency"
        hint="Amounts will be converted to your localised currency for projections.">
        <CurrencySelect
          value={form.currency}
          onChange={(currency) => setForm((prev) => ({ ...prev, currency }))}
        />
      </FormField>

      <FormField label="Billing cycle">
        <SegmentedControl
          options={cycleOptions}
          value={form.billingCycle}
          onChange={(billingCycle) => setForm((prev) => ({ ...prev, billingCycle }))}
        />
      </FormField>

      {form.billingCycle === 'custom' ? (
        <FormField
          label="Cycle length (days)"
          hint="Charge will repeat every N days."
          error={errors.customCycleDays}>
          <Input
            value={form.customCycleDays}
            onChangeText={(customCycleDays) => {
              clearError('customCycleDays');
              setForm((prev) => ({ ...prev, customCycleDays }));
            }}
            keyboardType="number-pad"
            error={Boolean(errors.customCycleDays)}
          />
        </FormField>
      ) : null}

      <FormField label="Start date" hint="Used to project upcoming charges.">
        <Pressable
          onPress={() => setDatePickerVisible((prev) => !prev)}
          style={[
            styles.dateField,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <ThemedText>{form.startDate.toISOString().slice(0, 10)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Tap to change
          </ThemedText>
        </Pressable>
        {datePickerVisible ? (
          <DateTimePicker
            value={form.startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
          />
        ) : null}
      </FormField>

      <Button
        label={submitLabel}
        onPress={submit}
        loading={submitting}
        fullWidth
        size="lg"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  dateField: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    minHeight: 52,
    justifyContent: 'center',
    gap: 2,
  },
});
