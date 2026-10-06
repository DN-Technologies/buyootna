import { BottomSheetView } from '@gorhom/bottom-sheet';
import type { ComponentProps } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * BottomSheetView that keeps its content clear of the home indicator /
 * Android navigation bar. Bottom sheets run edge-to-edge down to the screen
 * edge, so a sheet's bottom actions sat on the indicator (QA). The spacer is
 * inside the view so dynamic-sizing sheets measure it too.
 */
export default function SafeBottomSheetView({
  children,
  ...props
}: ComponentProps<typeof BottomSheetView>) {
  const { bottom } = useSafeAreaInsets();

  return (
    <BottomSheetView {...props}>
      {children}
      <View style={{ height: bottom }} />
    </BottomSheetView>
  );
}
