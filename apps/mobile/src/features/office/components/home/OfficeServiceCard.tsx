import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { OfficeDashboardService } from '../../types';

interface OfficeServiceCardProps {
  service: OfficeDashboardService;
  onPress?: () => void;
}

type ServiceKind = 'exchange' | 'buy' | 'rent' | 'other';

// Services are free text in the office profile; the icon and blurb follow
// the kind the title names
export function serviceKind(title: string): ServiceKind {
  if (/تبادل|بدل|تنسيق/.test(title)) return 'exchange';
  if (/شراء|للبيع|بيع/.test(title)) return 'buy';
  if (/ايجار|إيجار|للايجار|للإيجار/.test(title)) return 'rent';
  return 'other';
}

const BLURBS: Record<Exclude<ServiceKind, 'other'>, string> = {
  exchange:
    'إذا كان لديك طلب بدل في منطقة معينة وتبحث عن الطرف الآخر المناسب، سجل داتا عقارك والمنطقة المستهدفة، وسنتولى نحن مطابقة وتسهيل عملية التبادل.',
  buy: 'هل تبحث عن العقار المناسب وميزانية محددة؟ أخبرنا بطلبك وسنقوم بمسح السوق، معاينة الوحدات، وجلب خيارات الشراء الأكثر ملاءمة لك فوراً.',
  rent: 'هل تبحث عن السكن المثالي وميزانية محددة؟ أخبرنا بطلبك وسنقوم بمسح السوق، معاينة الوحدات، وجلب خيارات الإيجار الأكثر ملاءمة لك فوراً.',
};

function ServiceIcon({ kind }: { kind: ServiceKind }) {
  switch (kind) {
    case 'exchange':
      return (
        <MaterialCommunityIcons name="swap-horizontal" size={22} color="#FFFFFF" />
      );
    case 'buy':
      return <Ionicons name="search-outline" size={20} color="#FFFFFF" />;
    case 'rent':
      return <Feather name="home" size={19} color="#FFFFFF" />;
    default:
      return <Feather name="layers" size={19} color="#FFFFFF" />;
  }
}

export default function OfficeServiceCard({
  service,
  onPress,
}: OfficeServiceCardProps) {
  const kind = serviceKind(service.title);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="w-[309px] justify-between gap-2 rounded-[6px] border-[0.5px] border-[#ECECEC] bg-white py-4"
      accessibilityRole="button"
      accessibilityLabel={service.title}
    >
      <View className="items-start gap-3 px-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#15304D]">
          <ServiceIcon kind={kind} />
        </View>
        <View className="w-full items-start gap-2 pt-0.5">
          <Text
            className="font-cairo-bold text-[14px] text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {service.title}
          </Text>
          {kind !== 'other' && (
            <Text
              className="w-full font-cairo-medium text-[12px] leading-[17px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={3}
            >
              {BLURBS[kind]}
            </Text>
          )}
        </View>
      </View>

      {/* RTL: the open-requests pill (first) on the right */}
      <View className="flex-row items-center justify-between px-4">
        {service.openRequests > 0 ? (
          <View className="h-5 items-center justify-center rounded-bl-[10px] rounded-tl-[10px] rounded-tr-[8px] bg-[#F9FAFE] px-2.5">
            <Text
              className="font-almarai text-[12px] text-[#15304D]"
              style={{ writingDirection: 'rtl' }}
            >
              {`${service.openRequests} طلب نشط`}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <Text
          className="font-cairo-semibold text-[14px] text-[#15304D]"
          style={{ writingDirection: 'rtl' }}
        >
          إدارة الخدمة
        </Text>
      </View>
    </TouchableOpacity>
  );
}
