import { Text, View } from 'react-native';

import { readWeek, summarizeWeek } from '@/shared/utils/workingHours';

// One line of the section (re-exported for older imports)
export type { WorkingHourItem } from '@/shared/utils/workingHours';

interface CompanyWorkingHoursProps {
  // The saved مواعيد العمل (the API's WorkingDay[]); none: the section hides
  hours?: unknown;
}

export default function CompanyWorkingHours({
  hours,
}: CompanyWorkingHoursProps) {
  // What the company set; nothing made up when it hasn't
  const week = readWeek(hours);
  if (!week) return null;
  const schedule = summarizeWeek(week);

  return (
    <View className="mb-6">
      <Text className="mb-3 font-cairo-semibold text-[14px] leading-[22px] text-[#6B6A6A]"
        style={{writingDirection: "rtl"}}
      >
        مواعيد العمل
      </Text>

      <View className="space-y-2.5">
        {schedule.map((item, idx) => (
          <View
            key={idx}
            className="flex-row items-center gap-2"
          >
            <View
              className={`h-2.5 w-2.5 rounded-full ${
                item.isOpen ? 'bg-[#018B1B]' : 'bg-[#B97500]'
              }`}
            />
            <Text className="font-cairo-medium text-[14px] leading-[20px] text-[#111111]">
              {item.days}: {item.hours}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
