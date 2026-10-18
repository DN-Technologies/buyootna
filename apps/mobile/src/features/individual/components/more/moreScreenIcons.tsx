
import { NotificationIcon } from '@/assets/icons/home/header';

// Wrappers matching MenuItem's `icon: ComponentType<{color, size}>` prop
// shape, kept local to this screen.
interface IconProps {
  color?: string;
  size?: number;
}

export const BellIcon = ({ color, size }: IconProps) => (
  <NotificationIcon size={size} color={color} />
);
