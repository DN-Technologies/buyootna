import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { LocalAttachment } from '@/shared/api/chat.service';
import { showAlert } from '@/shared/utils/alert';
import { pickDocuments, pickPhotos, takePhoto } from '@/shared/utils/chatAttachments';

interface AttachmentPanelProps {
  // Same height as the keyboard it replaces
  height: number;
  onPicked: (files: LocalAttachment[]) => void;
  onClose: () => void;
}

const OPTIONS = [
  { key: 'photos', label: 'الصور', icon: 'image' as const, color: '#2563EB', pick: () => pickPhotos() },
  { key: 'camera', label: 'الكاميرا', icon: 'camera' as const, color: '#DB2777', pick: takePhoto },
  { key: 'file', label: 'مستند', icon: 'file-text' as const, color: '#7C3AED', pick: pickDocuments },
];

/**
 * Like WhatsApp: "+" swaps the keyboard for this panel (same height) with
 * الصور / الكاميرا / مستند.
 */
export default function AttachmentPanel({ height, onPicked, onClose }: AttachmentPanelProps) {
  const choose = (pick: () => Promise<LocalAttachment[] | null>) => async () => {
    onClose();
    try {
      const files = await pick();
      if (files?.length) onPicked(files);
    } catch (error) {
      console.error('Attachment pick failed:', error);
      showAlert('خطأ', 'تعذر فتح الملفات، تحقق من الأذونات وحاول مرة أخرى');
    }
  };

  return (
    <View
      testID="attachment-panel"
      className="flex-row flex-wrap justify-start gap-x-6 gap-y-5 bg-white px-8 pt-6"
      style={{ height }}
    >
      {OPTIONS.map((o) => (
        <TouchableOpacity
          key={o.key}
          testID={`attach-${o.key}`}
          activeOpacity={0.7}
          onPress={choose(o.pick)}
          className="w-[72px] items-center gap-1.5"
        >
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: o.color }}
          >
            <Feather name={o.icon} size={24} color="#FFFFFF" />
          </View>
          <Text className="font-cairo-medium text-[13px] text-[#111111]">{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
