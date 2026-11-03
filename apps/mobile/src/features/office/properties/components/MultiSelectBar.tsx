import { Text, TouchableOpacity, View } from 'react-native';

/**
 * «تحديد متعدد»: how many are picked, and what to do with them. No Figma
 * frame: built from the screen's buttons (hide / show in navy, delete red).
 */
export default function MultiSelectBar({
  count,
  anyHidden,
  anyShown,
  onHide,
  onShow,
  onDelete,
  onCancel,
  bottomInset,
}: {
  count: number;
  anyHidden: boolean;
  anyShown: boolean;
  onHide: () => void;
  onShow: () => void;
  onDelete: () => void;
  onCancel: () => void;
  bottomInset: number;
}) {
  const disabled = count === 0;
  const button = 'h-11 flex-1 items-center justify-center rounded-full';
  return (
    <View
      testID="multi-select-bar"
      className="border-t border-[#ECECEC] bg-white px-4 pt-3"
      style={{ paddingBottom: bottomInset + 12, gap: 10 }}
    >
      <View className="flex-row items-center justify-between">
        <Text
          testID="multi-select-count"
          className="font-cairo-semibold text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {`تم تحديد ${count}`}
        </Text>
        <TouchableOpacity testID="multi-select-cancel" onPress={onCancel}>
          <Text className="font-cairo-semibold text-[14px] text-[#15304D]">إلغاء</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row" style={{ gap: 8 }}>
        {anyShown && (
          <TouchableOpacity
            testID="multi-select-hide"
            disabled={disabled}
            onPress={onHide}
            className={`${button} bg-[#15304D] ${disabled ? 'opacity-40' : ''}`}
          >
            <Text className="font-cairo-semibold text-[14px] text-white">إخفاء</Text>
          </TouchableOpacity>
        )}
        {anyHidden && (
          <TouchableOpacity
            testID="multi-select-show"
            disabled={disabled}
            onPress={onShow}
            className={`${button} bg-[#15304D] ${disabled ? 'opacity-40' : ''}`}
          >
            <Text className="font-cairo-semibold text-[14px] text-white">إظهار</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID="multi-select-delete"
          disabled={disabled}
          onPress={onDelete}
          className={`${button} border border-[#9C1E28] bg-white ${disabled ? 'opacity-40' : ''}`}
        >
          <Text className="font-cairo-semibold text-[14px] text-[#9C1E28]">حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
