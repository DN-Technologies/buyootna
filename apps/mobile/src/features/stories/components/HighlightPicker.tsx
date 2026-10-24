import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { useHighlightMutations, useMyHighlights } from '../hooks/useStoryHighlights';
import SheetOptionRow from './SheetOptionRow';

const NAVY = '#15304D';
const GOLD = '#C5A36D';
// A highlight takes at most this many stories (the server's limit)
const ITEMS_MAX = 100;

interface HighlightPickerProps {
  // Added at the end of the picked highlight, in this order
  storyIds: string[];
  onAdded: (title: string) => void;
  // «مميزة جديدة»: its form, with these stories chosen
  onNew: () => void;
}

/**
 * Which highlight to add stories to: «مميزة جديدة», then each highlight
 * with its cover and size; one that already has them all says so.
 */
export default function HighlightPicker({ storyIds, onAdded, onNew }: HighlightPickerProps) {
  const { data } = useMyHighlights();
  const { update } = useHighlightMutations();
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const addTo = (id: string, title: string, current: string[]) => {
    setAddingTo(id);
    setFailed(false);
    const added = storyIds.filter((s) => !current.includes(s));
    update.mutate(
      { id, input: { storyIds: [...current, ...added].slice(0, ITEMS_MAX) } },
      {
        onSuccess: () => onAdded(title),
        onError: () => setFailed(true),
        onSettled: () => setAddingTo(null),
      },
    );
  };

  return (
    <View>
      <SheetOptionRow
        testID="highlight-picker-new"
        icon="plus"
        color={GOLD}
        title="مميزة جديدة"
        onPress={onNew}
      />
      {(data?.highlights ?? []).map((h) => {
        const ids = h.stories.map((s) => s.id);
        const already = storyIds.length > 0 && storyIds.every((s) => ids.includes(s));
        return (
          <TouchableOpacity
            key={h.id}
            testID={`highlight-picker-${h.id}`}
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
      {failed && (
        <Text className="px-5 pt-2 font-cairo text-[13px] text-[#BA0003]">
          تعذرت الإضافة، حاول مرة أخرى
        </Text>
      )}
    </View>
  );
}
