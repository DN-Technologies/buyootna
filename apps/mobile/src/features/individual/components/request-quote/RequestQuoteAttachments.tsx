import { Feather } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export interface RequestQuoteAttachmentsProps {
  attachments: string[];
  onPickAttachments: () => void;
  onRemoveAttachment: (index: number) => void;
}

export default function RequestQuoteAttachments({
  attachments,
  onPickAttachments,
  onRemoveAttachment,
}: RequestQuoteAttachmentsProps) {
  return (
    <View className="mb-2 w-full">
      <View className="mb-2 flex-row items-center gap-1">
        <Text
          className="font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          مرفقات
        </Text>
        <Feather name="info" size={13} color="#94A3B8" />
      </View>

      {attachments.length > 0 && (
        <View className="mb-3 flex-row flex-wrap gap-3">
          {attachments.map((uri, index) => (
            <View
              key={uri + index}
              className="relative h-[80px] w-[80px] overflow-hidden rounded-lg border border-gray-200"
            >
              <Image
                source={{ uri }}
                className="h-full w-full"
                resizeMode="cover"
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onRemoveAttachment(index)}
                className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500"
              >
                <Feather name="x" size={11} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPickAttachments}
        className="w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-6"
      >
        <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-[#F4F8FB]">
          <Feather name="upload" size={20} color="#15304D" />
        </View>
        <Text className="mb-1 font-cairo-semibold text-sm text-[#111111]">
          اضغط هنا لرفع الصور
        </Text>
        <Text className="px-6 text-center font-cairo-medium text-[11px] leading-5 text-[#94A3B8]">
          الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
        </Text>
      </TouchableOpacity>
    </View>
  );
}
