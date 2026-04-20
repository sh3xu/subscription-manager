import React from 'react';
import {
  KeyboardTypeOptions,
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type InputProps = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  autoFocus?: boolean;
  error?: boolean;
  multiline?: boolean;
  style?: ViewStyle;
  editable?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
};

export function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  leading,
  trailing,
  autoFocus,
  error,
  multiline,
  style,
  editable,
  returnKeyType,
  onSubmitEditing,
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = React.useState(false);
  const borderColor = error ? theme.danger : focused ? theme.accent : theme.border;

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.surface,
          borderColor,
        },
        style,
      ]}>
      {leading}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        multiline={multiline}
        editable={editable}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.text }, multiline && styles.multiline]}
        underlineColorAndroid="transparent"
      />
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? Spacing.three : Spacing.two,
    includeFontPadding: false,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
