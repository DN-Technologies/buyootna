import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useState } from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HighlightAdded from '../components/HighlightAdded';
import HighlightPicker from '../components/HighlightPicker';

interface HighlightPickerSheetProps {
  storyIds: string[];
  // Added (or sent to a new one's form): the studio ends its selection
  onDone: () => void;
}

/** The studio's «إضافة إلى المميزة» for the stories picked in the archive. */
const HighlightPickerSheet = forwardRef<BottomSheetModal, HighlightPickerSheetProps>(
  ({ storyIds, onDone }, ref) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [added, setAdded] = useState<string | null>(null);
    const dismiss = () =>
      (ref as React.RefObject<BottomSheetModal | null>)?.current?.dismiss();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        maxDynamicContentSize={560}
        backdropComponent={renderBackdrop}
        onDismiss={() => {
          if (added) onDone();
          setAdded(null);
        }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}>
          {added ? (
            <HighlightAdded title={added} />
          ) : (
            <>
              <Text className="mb-1 px-5 pt-1 font-cairo-bold text-[16px] leading-[24px] text-[#111111]">
                إضافة إلى المميزة ({storyIds.length})
              </Text>
              <HighlightPicker
                storyIds={storyIds}
                onAdded={(title) => {
                  setAdded(title);
                  setTimeout(dismiss, 900);
                }}
                onNew={() => {
                  dismiss();
                  onDone();
                  router.push({
                    pathname: '/stories/highlights/new',
                    params: { storyIds: storyIds.join(',') },
                  } as never);
                }}
              />
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);
HighlightPickerSheet.displayName = 'HighlightPickerSheet';

export default HighlightPickerSheet;
