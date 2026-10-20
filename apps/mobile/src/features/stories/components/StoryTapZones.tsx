import { I18nManager, Pressable, StyleSheet, View } from 'react-native';

import type { TapSide } from '../storyNavigation';

interface StoryTapZonesProps {
  onTap: (side: TapSide) => void;
  // A long press holds the story; letting go resumes it
  onHold: (holding: boolean) => void;
}

/** One tap zone per half of the screen, in the app's direction. */
export default function StoryTapZones({ onTap, onHold }: StoryTapZonesProps) {
  const sides: [TapSide, TapSide] = I18nManager.isRTL
    ? ['right', 'left']
    : ['left', 'right'];
  return (
    <View style={StyleSheet.absoluteFill} className="flex-row">
      {sides.map((side) => (
        <Pressable
          key={side}
          testID={`story-tap-${side}`}
          style={{ flex: 1 }}
          delayLongPress={200}
          onPress={() => onTap(side)}
          onLongPress={() => onHold(true)}
          onPressOut={() => onHold(false)}
        />
      ))}
    </View>
  );
}
