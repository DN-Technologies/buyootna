import { Feather } from '@expo/vector-icons';

// Thin Feather wrappers matching MenuItem's `icon: ComponentType<{color,
// size}>` prop shape -- kept local to this screen since these are one-off
// glyphs, unlike the custom SVGs in @/assets/icons/more.
interface IconProps {
  color?: string;
  size?: number;
}

export const InfoIcon = ({ color, size }: IconProps) => (
  <Feather name="info" color={color} size={size} />
);
export const HelpIcon = ({ color, size }: IconProps) => (
  <Feather name="help-circle" color={color} size={size} />
);
export const PhoneIcon = ({ color, size }: IconProps) => (
  <Feather name="phone" color={color} size={size} />
);
export const ShieldIcon = ({ color, size }: IconProps) => (
  <Feather name="shield" color={color} size={size} />
);
export const FileIcon = ({ color, size }: IconProps) => (
  <Feather name="file-text" color={color} size={size} />
);
export const BellIcon = ({ color, size }: IconProps) => (
  <Feather name="bell" color={color} size={size} />
);
