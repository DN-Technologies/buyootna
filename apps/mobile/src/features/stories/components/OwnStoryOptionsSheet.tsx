import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHighlightMutations, useMyHighlights } from '../hooks/useStoryHighlights';

const NAVY = '#15304D';
const GOLD = '#C5A36D';
const RED = '#BA0003';
// A highlight takes at most this many stories (the server's limit)
const ITEMS_MAX = 100;

interface OptionRowProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  testID?: string;
  busy?: boolean;
}

function OptionRow({ icon, color, title, subtitle, onPress, testID, busy }: OptionRowProps) {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      activeOpacity={0.6}
      disabled={busy}
      onPress={onPress}
      className="flex-row items-center px-5 py-[10px]"
      style={{ gap: 12 }}
    >
      <View
        className="size-[44px] items-center justify-center rounded-[14px]"
        style={{ backgroundColor: `${color}1A` }}
      >
        {busy ? (
          <ActivityIndicator color={color} />
        ) : (
          <Feather name={icon} size={19} color={color} />
        )}
      </View>
      <View className="flex-1 items-start">
        <Text
          className="font-cairo-semibold text-[15px] leading-[22px]"
          style={{ color: color === RED ? RED : '#111111' }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="font-cairo text-[12px] leading-[18px] text-[#6B6A6A]">
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

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
    const { data } = useMyHighlights();
    const { update } = useHighlightMutations();
    const [step, setStep] = useState<'menu' | 'pick'>('menu');
    const [addingTo, setAddingTo] = useState<string | null>(null);
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

    const addTo = (id: string, title: string, current: string[]) => {
      if (!storyId) return;
      setAddingTo(id);
      const next = current.includes(storyId)
        ? current
        : [...current, storyId].slice(0, ITEMS_MAX);
      update.mutate(
        { id, input: { storyIds: next } },
        {
          onSuccess: () => {
            setAdded(title);
            setTimeout(dismiss, 900);
          },
          onSettled: () => setAddingTo(null),
        },
      );
    };

    const highlights = data?.highlights ?? [];

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
            <View testID="own-story-added" className="items-center px-6 py-8" style={{ gap: 10 }}>
              <View
                className="size-[56px] items-center justify-center rounded-full"
                style={{ backgroundColor: `${GOLD}26` }}
              >
                <Feather name="check" size={26} color={GOLD} />
              </View>
              <Text className="font-cairo-semibold text-[16px] text-[#111111]">
                أضيفت إلى «{added}»
              </Text>
            </View>
          ) : step === 'menu' ? (
            <View className="pt-1">
              <Text className="mb-1 px-5 font-cairo-bold text-[16px] leading-[24px] text-[#111111]">
                قصتك
              </Text>
              {inHighlight ? (
                <OptionRow
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
                <OptionRow
                  testID="own-story-add-highlight"
                  icon="star"
                  color={GOLD}
                  title="إضافة إلى المميزة"
                  subtitle="تبقى ظاهرة في ملفك بعد 24 ساعة"
                  onPress={() => setStep('pick')}
                />
              )}
              <OptionRow
                testID="own-story-delete"
                icon="trash-2"
                color={RED}
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
              <OptionRow
                testID="own-story-new-highlight"
                icon="plus"
                color={GOLD}
                title="مميزة جديدة"
                onPress={() => {
                  dismiss();
                  router.push({
                    pathname: '/stories/highlights/new',
                    params: { storyIds: storyId ?? '' },
                  } as never);
                }}
              />
              {highlights.map((h) => {
                const ids = h.stories.map((s) => s.id);
                const already = !!storyId && ids.includes(storyId);
                return (
                  <TouchableOpacity
                    key={h.id}
                    testID={`own-story-pick-${h.id}`}
                    accessibilityRole="button"
                    activeOpacity={0.6}
                    disabled={already || addingTo !== null}
                    onPress={() => addTo(h.id, h.title, ids)}
                    className="flex-row items-center px-5 py-[8px]"
                    style={{ gap: 12, opacity: already ? 0.5 : 1 }}
                  >
                    <View
                      className="size-[46px] items-center justify-center rounded-full"
                      style={{ borderWidth: 2, borderColor: GOLD }}
                    >
                      <View className="size-[38px] items-center justify-center overflow-hidden rounded-full bg-[#F1F5F9]">
                        {h.coverUrl ? (
                          <Image
                            source={{ uri: h.coverUrl }}
                            cachePolicy="memory"
                            contentFit="cover"
                            style={{ width: '100%', height: '100%' }}
                          />
                        ) : (
                          <Feather name="star" size={16} color={GOLD} />
                        )}
                      </View>
                    </View>
                    <View className="flex-1 items-start">
                      <Text className="font-cairo-semibold text-[15px] leading-[22px] text-[#111111]">
                        {h.title}
                      </Text>
                      <Text className="font-cairo text-[12px] leading-[18px] text-[#6B6A6A]">
                        {already ? 'موجودة فيها' : `${ids.length} قصة`}
                      </Text>
                    </View>
                    {addingTo === h.id ? (
                      <ActivityIndicator color={NAVY} />
                    ) : (
                      already && <Feather name="check" size={18} color={GOLD} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);
OwnStoryOptionsSheet.displayName = 'OwnStoryOptionsSheet';

export default OwnStoryOptionsSheet;
