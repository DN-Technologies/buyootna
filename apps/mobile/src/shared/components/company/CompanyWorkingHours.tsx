import { Text, View } from 'react-native';

export interface WorkingHourItem {
  days: string;
  hours: string;
  isOpen: boolean;
}

interface CompanyWorkingHoursProps {
  schedule?: WorkingHourItem[];
}

const DEFAULT_SCHEDULE: WorkingHourItem[] = [
  { days: 'الأحد - الخميس', hours: '9:00 ص - 8:00 م.', isOpen: true },
  { days: 'الجمعة والسبت', hours: 'مغلق.', isOpen: false },
];

export default function CompanyWorkingHours({
  schedule = DEFAULT_SCHEDULE,
}: CompanyWorkingHoursProps) {
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
