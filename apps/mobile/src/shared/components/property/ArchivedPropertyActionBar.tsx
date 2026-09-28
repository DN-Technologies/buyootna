import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

export interface ArchivedPropertyActionBarProps {
  insets: EdgeInsets;
  onDelete: () => void;
  onRepublish: () => void;
  isRepublishing?: boolean;
  isDeleting?: boolean;
}

export default function ArchivedPropertyActionBar({
  insets,
  onDelete,
  onRepublish,
  isRepublishing = false,
  isDeleting = false,
}: ArchivedPropertyActionBarProps) {
  return (
    <View
      className="absolute bottom-0 w-full flex-row items-center justify-between gap-4 border-t border-[#ECECEC] bg-white px-4 pt-3.5 shadow-lg"
      style={{
        paddingBottom: Math.max(insets.bottom, 16),
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      }}
    >
      {/* Republish Button (Navy Blue) */}
      <TouchableOpacity
        testID="archived-republish-btn"
        activeOpacity={0.8}
        disabled={isRepublishing || isDeleting}
        onPress={onRepublish}
        className="h-[48px] flex-1 items-center justify-center rounded-[24px] bg-[#15304D] px-2 py-3"
      >
        {isRepublishing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-white">
            إعادة النشر
          </Text>
        )}
      </TouchableOpacity>

      {/* Delete Button (Red Outline) */}
      <TouchableOpacity
        testID="archived-delete-btn"
        activeOpacity={0.8}
        disabled={isDeleting || isRepublishing}
        onPress={onDelete}
        className="h-[48px] flex-1 items-center justify-center rounded-[24px] border border-[#9C1E28] bg-white px-2 py-3"
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#9C1E28" />
        ) : (
          <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-[#9C1E28]">
            حذف
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
