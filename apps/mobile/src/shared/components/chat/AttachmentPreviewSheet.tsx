import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocalAttachment } from '@/shared/api/chat.service';
import {
  attachmentsProblem,
  documentStyle,
  formatFileSize,
} from '@/shared/utils/chatAttachments';

interface AttachmentPreviewSheetProps {
  files: LocalAttachment[] | null;
  onClose: () => void;
  onSend: (files: LocalAttachment[], caption: string) => void;
}

/** Review picked files before sending: remove any, add a caption. */
export default function AttachmentPreviewSheet({
  files,
  onClose,
  onSend,
}: AttachmentPreviewSheetProps) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<LocalAttachment[]>([]);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    setItems(files ?? []);
    setCaption('');
  }, [files]);

  if (!files) return null;
  const problem = attachmentsProblem(items);
  const canSend = items.length > 0 && !problem;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            testID="attachment-preview-close"
            onPress={onClose}
            accessibilityLabel="إلغاء"
            className="p-1"
          >
            <Feather name="x" size={22} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-bold text-base text-[#111111]">
            {items.length === 1 ? 'إرسال مرفق' : `إرسال ${items.length} مرفقات`}
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {items.map((item, index) => (
            <View
              key={`${item.uri}-${index}`}
              testID="attachment-preview-item"
              className="flex-row items-center gap-3 rounded-xl border border-gray-100 p-2"
            >
              {item.kind === 'IMAGE' ? (
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: 64, height: 64, borderRadius: 8 }}
                  contentFit="cover"
                />
              ) : (
                <View
                  className="h-16 w-16 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${documentStyle(item.mimeType, item.name).color}1A` }}
                >
                  <Text
                    className="font-cairo-bold text-xs"
                    style={{ color: documentStyle(item.mimeType, item.name).color }}
                  >
                    {documentStyle(item.mimeType, item.name).label}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text numberOfLines={1} className="font-cairo-medium text-sm text-[#111111]">
                  {item.name}
                </Text>
                {!!item.size && (
                  <Text className="font-cairo text-xs text-[#6B6A6A]">
                    {formatFileSize(item.size)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                testID={`attachment-preview-remove-${index}`}
                onPress={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                accessibilityLabel="إزالة"
                className="p-2"
              >
                <Feather name="trash-2" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
          {problem && (
            <Text
              testID="attachment-preview-problem"
              className="font-cairo-medium text-sm text-[#DC2626]"
              style={{ writingDirection: 'rtl' }}
            >
              {problem}
            </Text>
          )}
        </ScrollView>

        <View
          className="flex-row items-end gap-2 border-t border-gray-100 px-4 pt-2.5"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <TextInput
            testID="attachment-preview-caption"
            value={caption}
            onChangeText={setCaption}
            placeholder="أضف تعليقاً (اختياري)..."
            placeholderTextColor="#979797"
            multiline
            className="max-h-28 flex-1 rounded-2xl bg-[#F9FAFE] px-4 py-2 text-right font-cairo text-[14px] text-[#111111]"
          />
          <TouchableOpacity
            testID="attachment-preview-send"
            disabled={!canSend}
            onPress={() => onSend(items, caption)}
            accessibilityLabel="إرسال"
            className={`h-11 w-11 items-center justify-center rounded-full ${
              canSend ? 'bg-[#15304D]' : 'bg-[#A0AEC0]'
            }`}
          >
            <Feather name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
