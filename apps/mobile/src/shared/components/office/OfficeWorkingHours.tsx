import { Text, View } from 'react-native';

import { LicenseIcon } from '@/assets/icons/home/property';
import { readWeek, summarizeWeek } from '@/shared/utils/workingHours';

interface OfficeWorkingHoursProps {
  licenseNumber?: string;
  // The saved مواعيد العمل (the API's WorkingDay[]); none: not shown
  hours?: unknown;
}

export default function OfficeWorkingHours({
  licenseNumber = '2454685',
  hours,
}: OfficeWorkingHoursProps) {
  // What the office set; nothing made up when it hasn't
  const week = readWeek(hours);
  const schedule = week ? summarizeWeek(week) : [];

  return (
    <View className="mb-6 space-y-4">
      {/* License Number Row */}
      {licenseNumber ? (
        <View className="flex-row items-center gap-2">
          <LicenseIcon color="#15304D" size={18} />
          <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
            رقم الرخصة {licenseNumber}
          </Text>
        </View>
      ) : null}

      {/* Working Hours Section */}
      {schedule.length > 0 && (
      <View>
        <Text
          className="mb-3 font-cairo-semibold text-[14px] leading-[22px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          مواعيد العمل
        </Text>

        <View className="space-y-2.5">
          {schedule.map((item, idx) => (
            <View key={idx} className="flex-row items-center gap-2">
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
      )}
    </View>
  );
}
