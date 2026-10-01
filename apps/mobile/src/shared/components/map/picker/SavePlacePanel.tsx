import { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { SavedLocationLabel } from '@/shared/api/savedLocations.service';

interface SavePlacePanelProps {
  onSave: (label: SavedLocationLabel, name?: string) => Promise<void>;
  onCancel: () => void;
}

const CHOICES: { label: SavedLocationLabel; title: string }[] = [
  { label: 'HOME', title: 'المنزل' },
  { label: 'WORK', title: 'العمل' },
  { label: 'OTHER', title: 'اسم آخر' },
];

// حفظ هذا الموقع: المنزل / العمل replace the saved one; اسم آخر needs a name
export function SavePlacePanel({ onSave, onCancel }: SavePlacePanelProps) {
  const [label, setLabel] = useState<SavedLocationLabel>('HOME');
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const canSave = label !== 'OTHER' || name.trim().length > 0;

  const save = async () => {
    if (!canSave || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(label, label === 'OTHER' ? name.trim() : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="mb-3 gap-2.5 rounded-2xl border border-gray-100 bg-gray-50 p-3">
      <Text
        className="font-cairo-semibold text-[13px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        حفظ هذا الموقع باسم
      </Text>
      <View className="flex-row gap-2">
        {CHOICES.map((choice) => {
          const selected = choice.label === label;
          return (
            <TouchableOpacity
              key={choice.label}
              testID={`save-place-${choice.label}`}
              activeOpacity={0.8}
              onPress={() => setLabel(choice.label)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className={`h-9 flex-1 items-center justify-center rounded-full border ${
                selected ? 'border-[#15304D] bg-[#15304D]' : 'border-gray-200 bg-white'
              }`}
            >
              <Text
                className={`font-cairo-medium text-[12px] ${
                  selected ? 'text-white' : 'text-[#111111]'
                }`}
              >
                {choice.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {label === 'OTHER' && (
        <TextInput
          testID="save-place-name"
          value={name}
          onChangeText={setName}
          placeholder="مثال: بيت الأهل"
          placeholderTextColor="#979797"
          maxLength={40}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 font-cairo text-[13px] text-[#111111]"
          style={{ textAlign: 'right', writingDirection: 'rtl' }}
        />
      )}
      <View className="flex-row gap-2">
        <TouchableOpacity
          testID="save-place-confirm"
          activeOpacity={0.8}
          disabled={!canSave || isSaving}
          onPress={save}
          className={`h-10 flex-1 items-center justify-center rounded-full bg-[#15304D] ${
            !canSave ? 'opacity-50' : ''
          }`}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="font-cairo-semibold text-[13px] text-white">حفظ</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          testID="save-place-cancel"
          activeOpacity={0.8}
          onPress={onCancel}
          className="h-10 flex-1 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <Text className="font-cairo-semibold text-[13px] text-[#111111]">
            إلغاء
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
