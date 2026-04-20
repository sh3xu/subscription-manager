import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { CURRENCIES, CurrencyOption, getCurrencyName } from '@/constants/currencies';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CurrencySelectProps = {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
};

export function CurrencySelect({ value, onChange, placeholder = 'Select currency' }: CurrencySelectProps) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (item) =>
        item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
    );
  }, [query]);

  const selected = value ? { code: value, name: getCurrencyName(value) } : null;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const handleSelect = (option: CurrencyOption) => {
    onChange(option.code);
    close();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        accessibilityRole="button">
        <View style={styles.triggerBody}>
          {selected ? (
            <>
              <ThemedText type="smallBold">{selected.code}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {selected.name}
              </ThemedText>
            </>
          ) : (
            <ThemedText type="small" themeColor="textMuted">
              {placeholder}
            </ThemedText>
          )}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Change
        </ThemedText>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}>
        <SafeAreaView
          edges={['top', 'left', 'right']}
          style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={styles.sheetHeader}>
            <ThemedText type="subtitle" style={styles.sheetTitle}>
              Select currency
            </ThemedText>
            <Button label="Done" variant="ghost" onPress={close} />
          </View>

          <View
            style={[
              styles.searchWrap,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by code or name"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item.code === value;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: isSelected ? theme.accentSoft : theme.surface,
                      borderColor: isSelected ? theme.accent : theme.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  <View style={styles.rowText}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: isSelected ? theme.accent : theme.text }}>
                      {item.code}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                  </View>
                  {isSelected ? (
                    <ThemedText style={{ color: theme.accent, fontSize: 18 }}>✓</ThemedText>
                  ) : null}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <ThemedText type="small" themeColor="textSecondary">
                  No currencies match &quot;{query}&quot;.
                </ThemedText>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 56,
  },
  triggerBody: {
    flex: 1,
    gap: 2,
  },
  sheet: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  sheetTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  searchWrap: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
  },
  searchInput: {
    fontSize: 16,
    minHeight: 48,
  },
  list: {
    gap: Spacing.one,
    paddingBottom: Spacing.six,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  empty: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
});
