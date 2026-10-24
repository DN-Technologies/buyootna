import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/shared/store/useAuthStore';

import { useStoryArchive } from '../hooks/useStoryHighlights';
import type { StoryHighlight, ViewerStory } from '../types';
import StudioArchiveGrid from './StudioArchiveGrid';
import { GOLD, NAVY, stillOf } from './studioMedia';

const TITLE_MAX = 20;

export interface HighlightFormValue {
  title: string;
  storyIds: string[];
  coverStoryId: string | null;
}

interface HighlightFormProps {
  heading: string;
  // Editing: its name, stories (even past the 30 days) and cover
  initial?: StoryHighlight;
  // Creating from the studio's selection
  preselected?: string[];
  saving: boolean;
  onSave: (value: HighlightFormValue) => void;
  onDelete?: () => void;
}

/**
 * A highlight's name, its stories in the order picked (from the 30-day
 * archive, plus those it already keeps) and its cover.
 */
export default function HighlightForm({
  heading,
  initial,
  preselected = [],
  saving,
  onSave,
  onDelete,
}: HighlightFormProps) {
  const router = useRouter();
  const identityId = useAuthStore((s) => s.activeIdentity?.id ?? '');
  const archive = useStoryArchive();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [selected, setSelected] = useState<string[]>(
    initial ? initial.stories.map((s) => s.id) : preselected,
  );
  const [cover, setCover] = useState<string | null>(initial?.coverStoryId ?? null);

  // Its own stories first (some may be older than the archive), then the rest
  const choices = useMemo<ViewerStory[]>(() => {
    const own = initial?.stories ?? [];
    const ownIds = new Set(own.map((s) => s.id));
    return [...own, ...archive.stories.filter((s) => !ownIds.has(s.id))];
  }, [initial, archive.stories]);
  const byId = new Map(choices.map((s) => [s.id, s]));
  const picked = selected.map((id) => byId.get(id)).filter(Boolean) as ViewerStory[];
  const coverId = cover && selected.includes(cover) ? cover : (selected[0] ?? null);

  const toggle = (id: string) =>
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  const canSave = title.trim().length > 0 && selected.length > 0 && !saving;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between border-b border-gray-50 px-4 py-3">
        <TouchableOpacity accessibilityLabel="رجوع" onPress={() => router.back()} className="w-[60px]">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-[17px] leading-[26px] text-[#111111]">
          {heading}
        </Text>
        <TouchableOpacity
          testID="highlight-save"
          accessibilityRole="button"
          disabled={!canSave}
          onPress={() =>
            onSave({ title: title.trim(), storyIds: selected, coverStoryId: coverId })
          }
          className="w-[60px] items-end"
        >
          {saving ? (
            <ActivityIndicator color={NAVY} />
          ) : (
            <Text
              className="font-cairo-bold text-[15px] leading-[24px]"
              style={{ color: canSave ? NAVY : '#94A3B8' }}
            >
              حفظ
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* The cover, as on the profile */}
        <View className="items-center pt-5">
          <View
            className="size-[92px] items-center justify-center rounded-full"
            style={{ borderWidth: 2, borderColor: GOLD }}
          >
            <View className="size-[82px] items-center justify-center overflow-hidden rounded-full bg-[#F1F5F9]">
              {coverId && byId.get(coverId) && stillOf(byId.get(coverId)!) ? (
                <Image
                  source={{ uri: stillOf(byId.get(coverId)!)! }}
                  cachePolicy="memory"
                  contentFit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Feather name="star" size={26} color={GOLD} />
              )}
            </View>
          </View>
        </View>

        <View className="mx-4 mt-4 flex-row items-center rounded-[14px] bg-[#F6F7F9] px-4">
          <TextInput
            testID="highlight-title"
            value={title}
            onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
            placeholder="اسم المميزة، مثل: مشاريعنا"
            placeholderTextColor="#94A3B8"
            maxLength={TITLE_MAX}
            className="h-[48px] flex-1 text-right font-cairo text-[15px] text-[#111111]"
          />
          <Text className="font-cairo text-[12px] text-[#94A3B8]">
            {title.length}/{TITLE_MAX}
          </Text>
        </View>

        {picked.length > 1 && (
          <View className="mt-5">
            <Text className="mb-2 px-4 font-cairo-semibold text-[14px] text-[#111111]">
              الغلاف
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              {picked.map((story) => {
                const still = stillOf(story);
                const isCover = story.id === coverId;
                return (
                  <TouchableOpacity
                    key={story.id}
                    testID={`highlight-cover-${story.id}`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isCover }}
                    onPress={() => setCover(story.id)}
                    className="size-[52px] overflow-hidden rounded-full bg-[#F1F5F9]"
                    style={{ borderWidth: 2, borderColor: isCover ? GOLD : 'transparent' }}
                  >
                    {still && (
                      <Image
                        source={{ uri: still }}
                        cachePolicy="memory"
                        contentFit="cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <Text className="mb-2 mt-5 px-4 font-cairo-semibold text-[14px] text-[#111111]">
          القصص ({selected.length})
        </Text>
        <StudioArchiveGrid
          stories={choices}
          identityId={identityId}
          selecting
          selected={selected}
          onToggle={toggle}
        />

        {onDelete && (
          <TouchableOpacity
            testID="highlight-delete"
            accessibilityRole="button"
            onPress={onDelete}
            className="mx-4 mt-8 h-[48px] items-center justify-center rounded-full border border-[#BA0003]"
          >
            <Text className="font-cairo-semibold text-[15px] text-[#BA0003]">
              حذف المميزة
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
