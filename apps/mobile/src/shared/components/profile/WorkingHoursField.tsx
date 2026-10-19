import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { CalendarClockIcon } from '@/assets/icons/more';
import WorkingHoursEditor from '@/shared/components/profile/WorkingHoursEditor';
import {
  readWeek,
  summarizeWeek,
  type WorkingDay,
} from '@/shared/utils/workingHours';

interface WorkingHoursFieldProps {
  // The saved hours: the API's array, or the form's JSON text
  value: unknown;
  onChange: (week: WorkingDay[]) => void;
  labelClassName?: string;
}

/**
 * مواعيد العمل on edit profile: the week's hours in short, opening the
 * day-by-day editor (WorkingHoursEditor) on tap.
 */
export default function WorkingHoursField({
  value,
  onChange,
  labelClassName = 'mb-1.5 font-cairo-medium text-[14px] text-[#111111]',
}: WorkingHoursFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const week = readWeek(value);
  const lines = week ? summarizeWeek(week) : [];

  return (
    <View>
      <Text className={labelClassName} style={{ writingDirection: 'rtl' }}>
        مواعيد العمل
      </Text>
      <TouchableOpacity
        testID="working-hours-field"
        activeOpacity={0.7}
        onPress={() => setIsOpen(true)}
        className="min-h-[46px] flex-row items-center justify-between gap-2 rounded-[8px] border border-[#ECECEC] bg-white px-3 py-2"
      >
        <View className="flex-1">
          {lines.length ? (
            lines.map((line) => (
              <Text
                key={line.days}
                className="font-cairo-regular text-[13px] leading-[22px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {line.days}: {line.hours}
              </Text>
            ))
          ) : (
            <Text
              className="font-cairo-regular text-[14px] leading-[22px] text-[#979797]"
              style={{ writingDirection: 'rtl' }}
            >
              حدد أيام وساعات العمل
            </Text>
          )}
        </View>
        <CalendarClockIcon size={18} color="#111111" />
      </TouchableOpacity>

      <WorkingHoursEditor
        visible={isOpen}
        value={week}
        onClose={() => setIsOpen(false)}
        onSave={(next) => {
          onChange(next);
          setIsOpen(false);
        }}
      />
    </View>
  );
}
