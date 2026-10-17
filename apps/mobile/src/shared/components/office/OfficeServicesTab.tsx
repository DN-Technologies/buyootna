import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

export interface OfficeServiceItemData {
  id: string;
  title: string;
  description: string;
}

interface OfficeServicesTabProps {
  services?: OfficeServiceItemData[];
}

const DEFAULT_SERVICES: OfficeServiceItemData[] = [
  {
    id: '1',
    title: 'بيع وتأجير العقارات',
    description: 'تسويق وإدارة العقارات السكنية والتجارية في جميع مناطق الكويت.',
  },
  {
    id: '2',
    title: 'استشارات عقارية',
    description: 'تقديم دراسات واستشارات متخصصة للسوق العقاري.',
  },
];

type FeatherName = ComponentProps<typeof Feather>['name'];

// The round icon above each service (Figma 1258:120927): rent, buy and
// exchange services get their own, anything else a briefcase
function serviceIcon(title: string): FeatherName {
  if (/ايجار|إيجار|تأجير/.test(title)) return 'key';
  if (/بدل|تبادل/.test(title)) return 'repeat';
  if (/شراء|بيع/.test(title)) return 'tag';
  return 'briefcase';
}

export default function OfficeServicesTab({
  services = DEFAULT_SERVICES,
}: OfficeServicesTabProps) {
  return (
    <View className="flex-1 pb-24">
      <View className="mb-6" style={{ gap: 12 }}>
        {services.map((svc) => (
          <View
            key={svc.id}
            testID={`office-service-${svc.id}`}
            className="w-full items-start rounded-[6px] border-[0.5px] border-[#ECECEC] bg-white p-4"
            style={{ gap: 16 }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#15304D]">
              <Feather name={serviceIcon(svc.title)} size={20} color="#FFFFFF" />
            </View>
            <View className="w-full pt-0.5" style={{ gap: 8 }}>
              <Text
                className="font-cairo-bold text-[14px] leading-[21px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {svc.title}
              </Text>
              <Text
                className="font-cairo-medium text-[12px] leading-[17px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                {svc.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
