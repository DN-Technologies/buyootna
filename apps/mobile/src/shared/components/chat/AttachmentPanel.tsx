import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { LocalAttachment } from '@/shared/api/chat.service';
import { showAlert } from '@/shared/utils/alert';
import {
  pickDocuments,
  pickPhotos,
  pickVideo,
  takePhoto,
} from '@/shared/utils/chatAttachments';

export type ChatComposer = 'property' | 'location' | 'appointment' | 'offer';

interface AttachmentPanelProps {
  // Same height as the keyboard it replaces
  height: number;
  onPicked: (files: LocalAttachment[]) => void;
  // عقار / الموقع / موعد معاينة / عرض سعر open their own sheets
  onCompose?: (composer: ChatComposer) => void;
  onClose: () => void;
}

const OPTIONS = [
  { key: 'photos', label: 'الصور', icon: 'image' as const, color: '#2563EB', pick: () => pickPhotos() },
  { key: 'camera', label: 'الكاميرا', icon: 'camera' as const, color: '#DB2777', pick: takePhoto },
  { key: 'video', label: 'فيديو', icon: 'video' as const, color: '#DC2626', pick: pickVideo },
  { key: 'file', label: 'مستند', icon: 'file-text' as const, color: '#7C3AED', pick: pickDocuments },
];

const COMPOSERS: {
  key: ChatComposer;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}[] = [
  { key: 'property', label: 'عقار', icon: 'home', color: '#15304D' },
  { key: 'location', label: 'الموقع', icon: 'map-pin', color: '#16A34A' },
  { key: 'appointment', label: 'موعد معاينة', icon: 'calendar', color: '#EA580C' },
  { key: 'offer', label: 'عرض سعر', icon: 'dollar-sign', color: '#0891B2' },
];

/**
 * Like WhatsApp: "+" swaps the keyboard for this panel (same height) with
 * الصور / الكاميرا / مستند.
 */
export default function AttachmentPanel({
  height,
  onPicked,
  onCompose,
  onClose,
}: AttachmentPanelProps) {
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
      className="flex-row flex-wrap gap-y-5 bg-white px-3 pt-6"
      style={{ height }}
    >
      {OPTIONS.map((o) => (
        <TouchableOpacity
          key={o.key}
          testID={`attach-${o.key}`}
          activeOpacity={0.7}
          onPress={choose(o.pick)}
          className="w-1/4 items-center gap-1.5"
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
      {onCompose &&
        COMPOSERS.map((c) => (
          <TouchableOpacity
            key={c.key}
            testID={`attach-${c.key}`}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onCompose(c.key);
            }}
            className="w-1/4 items-center gap-1.5"
          >
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: c.color }}
            >
              <Feather name={c.icon} size={24} color="#FFFFFF" />
            </View>
            <Text className="text-center font-cairo-medium text-[13px] text-[#111111]">
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  );
}
