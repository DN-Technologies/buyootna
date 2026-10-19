import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import type { ViewerStory } from '../types';

interface StoryFooterProps {
  story: ViewerStory;
  onOpenProperty: (propertyId: string) => void;
  onReply: () => void;
  replying: boolean;
  // The author looking at its own story: views instead of a reply
  own?: { viewCount: number; onViewers: () => void };
}

/** The caption, the linked listing, and a reply that opens the chat. */
export default function StoryFooter({
  story,
  onOpenProperty,
  onReply,
  replying,
  own,
}: StoryFooterProps) {
  return (
    <View className="gap-3">
      {!!story.caption && (
        <Text
          testID="story-caption"
          className="font-cairo-medium text-[14px] leading-[22px] text-white"
          style={{ writingDirection: 'rtl' }}
        >
          {story.caption}
        </Text>
      )}
      <View className="flex-row items-center gap-2">
        {story.property && (
          <TouchableOpacity
            testID="story-open-property"
            onPress={() => story.property && onOpenProperty(story.property.id)}
            activeOpacity={0.8}
            className="h-11 flex-row items-center gap-2 rounded-full bg-white px-4"
          >
            <Feather name="home" size={16} color="#15304D" />
            <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
              عرض الإعلان
            </Text>
          </TouchableOpacity>
        )}
        {own ? (
          <TouchableOpacity
            testID="story-viewers"
            onPress={own.onViewers}
            activeOpacity={0.8}
            className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-white/60"
          >
            <Feather name="eye" size={16} color="#FFFFFF" />
            <Text className="font-cairo-semibold text-[14px] text-white">
              المشاهدون · {own.viewCount}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            testID="story-reply"
            onPress={onReply}
            disabled={replying}
            activeOpacity={0.8}
            className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-white/60"
          >
            <Feather name="message-circle" size={16} color="#FFFFFF" />
            <Text className="font-cairo-semibold text-[14px] text-white">
              إرسال رسالة
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
