import * as icons from 'lucide-react-native/icons';
import React from 'react';

const iconRegistry = { ...icons };

type IconProps = {
  name: keyof typeof iconRegistry;
  color?: string;
  size?: number;
};

export function Icon({ name, color, size }: IconProps) {
  const LucideIcon = iconRegistry[name];
  return <LucideIcon color={color} size={size} />;
}
