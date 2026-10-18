import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { NotificationIcon } from '@/assets/icons/home/header';

// Thin Feather wrappers matching MenuItem's `icon: ComponentType<{color,
// size}>` prop shape -- kept local to this screen since these are one-off
// glyphs, unlike the custom SVGs in @/assets/icons/more.
interface IconProps {
  color?: string;
  size?: number;
}

// A Feather glyph is text, and text is cut at its box: MenuItem's icon box
// (20pt) is smaller than its icon size (22), so the glyph's edge was clipped
// (the SVG icons just overflow). A box of the glyph's own size holds it whole.
const featherIcon = (name: ComponentProps<typeof Feather>['name']) => {
  const Icon = ({ color, size = 22 }: IconProps) => (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Feather name={name} color={color} size={size} />
    </View>
  );
  Icon.displayName = `FeatherIcon(${name})`;
  return Icon;
};

export const InfoIcon = featherIcon('info');
export const HelpIcon = featherIcon('help-circle');
export const PhoneIcon = featherIcon('phone');
export const ShieldIcon = featherIcon('shield');
export const FileIcon = featherIcon('file-text');
export const BellIcon = ({ color, size }: IconProps) => (
  <NotificationIcon size={size} color={color} />
);
