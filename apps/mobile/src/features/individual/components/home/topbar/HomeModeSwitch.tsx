import { Image } from 'expo-image';

import ModeSwitch from '@/shared/components/ui/ModeSwitch';

export type HomeMode = 'home' | 'stories';

interface HomeModeSwitchProps {
  mode: HomeMode;
  onChange: (mode: HomeMode) => void;
}

const MODES = [
  // In reading order: «الرئيسية» on the right
  {
    id: 'home' as const,
    label: 'الرئيسية',
    icon: (
      <Image
        source={require('@/assets/icons/home/topbar/home.svg')}
        // The house sits in a 16pt square, the circle fills its 18
        style={{ width: 14.133, height: 14.133 }}
        contentFit="contain"
      />
    ),
  },
  {
    id: 'stories' as const,
    label: 'القصص',
    icon: (
      <Image
        source={require('@/assets/icons/home/topbar/circle-dashed.svg')}
        style={{ width: 18, height: 18 }}
        contentFit="contain"
      />
    ),
  },
];

/** «الرئيسية» / «القصص» on the individual home. */
export default function HomeModeSwitch({ mode, onChange }: HomeModeSwitchProps) {
  return (
    <ModeSwitch
      testID="home-mode-switch"
      modes={MODES}
      value={mode}
      onChange={onChange}
    />
  );
}
