import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type AvatarDotProps = {
  label: string;
  color?: string | null;
};

// NOTE: deterministic tint so two subscriptions with the same name get the same dot color.
const ACCENTS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'];

function pickColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

export function AvatarDot({ label, color }: AvatarDotProps) {
  const resolved = color ?? pickColor(label || '?');
  const initial = (label || '?').trim().charAt(0).toUpperCase();

  return (
    <View style={[styles.dot, { backgroundColor: `${resolved}22`, borderColor: resolved }]}>
      <ThemedText style={[styles.initial, { color: resolved }]}>{initial || '?'}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  initial: {
    fontSize: 16,
    fontWeight: '700',
  },
});
