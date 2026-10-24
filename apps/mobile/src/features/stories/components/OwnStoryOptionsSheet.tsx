import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HighlightAdded from './HighlightAdded';
import HighlightPicker from './HighlightPicker';
import SheetOptionRow, { SHEET_RED } from './SheetOptionRow';

const NAVY = '#15304D';
const GOLD = '#C5A36D';

interface OwnStoryOptionsSheetProps {
  storyId: string | null;
  // Played from one of the author's highlights: offer to take it out
  inHighlight: boolean;
  onRemoveFromHighlight: () => void;
  onDelete: () => void;
  // Closed without acting: the story resumes
  onDismiss: () => void;
}

/**
 * The author's options on its own story, inside the viewer: add it to a
 * highlight (picking which, or a new one), take it out of this highlight,
 * or delete it.
 */
const OwnStoryOptionsSheet = forwardRef<BottomSheetModal, OwnStoryOptionsSheetProps>(
  ({ storyId, inHighlight, onRemoveFromHighlight, onDelete, onDismiss }, ref) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState<'menu' | 'pick'>('menu');
    const [added, setAdded] = useState<string | null>(null);
    // Delete opens its confirmation once this sheet has closed
    const deleteNext = useRef(false);

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
          setStep('menu');
          setAdded(null);
          if (deleteNext.current) {
            deleteNext.current = false;
            onDelete();
          } else {
            onDismiss();
          }
        }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}>
          {added ? (
            <HighlightAdded title={added} />
          ) : step === 'menu' ? (
            <View className="pt-1">
              <Text className="mb-1 px-5 font-cairo-bold text-[16px] leading-[24px] text-[#111111]">
                قصتك
              </Text>
              {inHighlight ? (
                <SheetOptionRow
                  testID="own-story-remove-highlight"
                  icon="minus-circle"
                  color={NAVY}
                  title="إزالة من المميزة"
                  subtitle="تبقى في الأرشيف ما دامت ضمن آخر 30 يوماً"
                  onPress={() => {
                    onRemoveFromHighlight();
                    dismiss();
                  }}
                />
              ) : (
                <SheetOptionRow
                  testID="own-story-add-highlight"
                  icon="star"
                  color={GOLD}
                  title="إضافة إلى المميزة"
                  subtitle="تبقى ظاهرة في ملفك بعد 24 ساعة"
                  onPress={() => setStep('pick')}
                />
              )}
              <SheetOptionRow
                testID="own-story-delete"
                icon="trash-2"
                color={SHEET_RED}
                title="حذف القصة"
                subtitle="تختفي من حسابك ومن كل المميزة"
                onPress={() => {
                  deleteNext.current = true;
                  dismiss();
                }}
              />
            </View>
          ) : (
            <View className="pt-1">
              <View className="mb-1 flex-row items-center px-5" style={{ gap: 8 }}>
                <TouchableOpacity accessibilityLabel="رجوع" hitSlop={10} onPress={() => setStep('menu')}>
                  <Feather name="chevron-right" size={22} color="#111111" />
                </TouchableOpacity>
                <Text className="font-cairo-bold text-[16px] leading-[24px] text-[#111111]">
                  إضافة إلى المميزة
                </Text>
              </View>
              <HighlightPicker
                storyIds={storyId ? [storyId] : []}
                onAdded={(title) => {
                  setAdded(title);
                  setTimeout(dismiss, 900);
                }}
                onNew={() => {
                  dismiss();
                  router.push({
                    pathname: '/stories/highlights/new',
                    params: { storyIds: storyId ?? '' },
                  } as never);
                }}
              />
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);
OwnStoryOptionsSheet.displayName = 'OwnStoryOptionsSheet';

export default OwnStoryOptionsSheet;
