import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

import ModeSwitch from '@/shared/components/ui/ModeSwitch';

export type BusinessHomeMode = 'home' | 'studio';

const MODES = [
  // In reading order: «الرئيسية» on the right
  {
    id: 'home' as const,
    label: 'الرئيسية',
    icon: (
      <Image
        source={require('@/assets/icons/home/topbar/home.svg')}
        style={{ width: 14.133, height: 14.133 }}
        contentFit="contain"
      />
    ),
  },
  {
    id: 'studio' as const,
    label: 'الاستوديو',
    icon: <Feather name="aperture" size={16} color="#111111" />,
  },
];

interface StudioModeSwitchProps {
  mode: BusinessHomeMode;
  onChange: (mode: BusinessHomeMode) => void;
}

/** «الرئيسية» / «الاستوديو» on the company and office homes. */
export default function StudioModeSwitch({ mode, onChange }: StudioModeSwitchProps) {
  return (
    <ModeSwitch
      testID="business-mode-switch"
      modes={MODES}
      value={mode}
      onChange={onChange}
    />
  );
}
