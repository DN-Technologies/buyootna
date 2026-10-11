import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { formatDuration } from '@/shared/utils/chatAttachments';

interface VoiceRecordingRowProps {
  elapsedMs: number;
  // Locked: a delete button instead of the "slide to cancel" hint
  locked: boolean;
  cancelling: boolean;
  onDelete: () => void;
}

/** Shown instead of the text field while a voice note is being recorded. */
export default function VoiceRecordingRow({
  elapsedMs,
  locked,
  cancelling,
  onDelete,
}: VoiceRecordingRowProps) {
  return (
    <View
      testID="voice-recording-row"
      className="mx-3 min-h-[46px] flex-1 flex-row items-center justify-between rounded-[20px] bg-[#FEF2F2] px-4"
    >
      <View className="flex-row items-center gap-2">
        <View className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
        <Text
          testID="voice-timer"
          className="font-cairo-semibold text-[14px] text-[#111111]"
        >
          {formatDuration(elapsedMs)}
        </Text>
      </View>
      {locked ? (
        <TouchableOpacity
          testID="voice-cancel"
          accessibilityLabel="حذف التسجيل"
          onPress={onDelete}
          className="p-1"
        >
          <Feather name="trash-2" size={18} color="#DC2626" />
        </TouchableOpacity>
      ) : (
        <Text className="font-cairo text-[12px] text-[#6B6A6A]">
          {cancelling ? 'ارفع إصبعك للإلغاء' : 'اسحب للإلغاء'}
        </Text>
      )}
    </View>
  );
}
