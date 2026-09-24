import { Image } from 'expo-image';
import { useState } from 'react';
import { I18nManager, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AlertItem } from '@/shared/api/alerts.service';
import {
  CATEGORY_OPTIONS,
  OPERATION_OPTIONS,
} from '@/shared/components/add-alert/AlertPropertiesTab';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

export interface AlertListItemProps {
  alert: AlertItem;
  isActive?: boolean;
  onToggleActive?: (id: string, nextActive: boolean) => void;
  onDeletePress: (id: string) => void;
}

const isRTL = I18nManager.isRTL;

// --- Sub-components & Icons ---

function JusticeMinistryEmblem({ size = 36 }: { size?: number }) {
  // Source logo is 140x160
  return (
    <Image
      source={require('@/assets/images/justice-logo.png')}
      style={{ width: size, height: (size * 160) / 140 }}
      contentFit="contain"
      accessibilityLabel="وزارة العدل"
    />
  );
}

function PropertyNotificationIcon() {
  return (
    <View className="h-8 w-8 items-center justify-center rounded-full bg-[#15304D]">
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19 8V2M22 5h-6"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function ExchangeIcon() {
  return (
    <View className="h-8 w-8 items-center justify-center rounded-full bg-[#15304D]">
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7 3L7 21M7 3L3 7M7 3L11 7"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M17 21L17 3M17 21L13 17M17 21L21 17"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function CalendarIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
        stroke="#111111"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 2V6M8 2V6M3 10H21"
        stroke="#111111"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface CustomToggleProps {
  isOn: boolean;
  onToggle: () => void;
  testID?: string;
}

function CustomToggle({ isOn, onToggle, testID }: CustomToggleProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      testID={testID ?? 'alert-toggle-switch'}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn }}
      accessibilityLabel={isOn ? 'تفعيل التنبيه' : 'ايقاف التنبيه'}
      style={{
        width: 24,
        height: 14,
        borderRadius: 12,
        backgroundColor: isOn ? '#15304D' : '#D7D7D7',
        padding: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: isOn ? 'flex-start': 'flex-end',
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </TouchableOpacity>
  );
}

// --- Helpers ---

const AMENITY_LABELS: Record<string, string> = {
  pool: 'حمام سباحة',
  garage: 'جراج',
  elevator: 'مصعد',
  garden: 'حديقة',
  maid_room: 'غرفة خادمة',
  central_ac: 'تكييف مركزي',
  security: 'أمن وحراسة',
  furnished: 'مفروشة',
};

function toArabicNumerals(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
}

function findLabel(list: { id: string; label: string }[], id: string | null) {
  if (!id) return undefined;
  return list.find((item) => item.id === id)?.label;
}

function formatAuctionDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatRelativeMatchTime(dateStr?: string | null): string {
  if (!dateStr) return 'اخر تطابق منذ 5 ساعات';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (diffMs <= 0) return 'اخر تطابق منذ قليل';
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'اخر تطابق منذ قليل';
    if (diffHours < 24) return `اخر تطابق منذ ${diffHours} ساعات`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'اخر تطابق منذ يوم';
    if (diffDays === 2) return 'اخر تطابق منذ يومين';
    if (diffDays <= 10) return `اخر تطابق منذ ${diffDays} أيام`;
    return `اخر تطابق منذ ${diffDays} يوم`;
  } catch {
    return 'اخر تطابق منذ 5 ساعات';
  }
}

export default function AlertListItem({
  alert,
  isActive: controlledIsActive,
  onToggleActive,
  onDeletePress,
}: AlertListItemProps) {
  const [internalActive, setInternalActive] = useState(true);
  const isActive = controlledIsActive !== undefined ? controlledIsActive : internalActive;

  const handleToggle = () => {
    const nextState = !isActive;
    if (controlledIsActive === undefined) {
      setInternalActive(nextState);
    }
    onToggleActive?.(alert.id, nextState);
  };

  const isAuction = alert.type === 'AUCTIONS';
  const isExchange = alert.operationType === 'EXCHANGE';

  const governorateLabel = findLabel(GOVERNORATES, alert.governorateId);
  const areaLabel = findLabel(AREAS[alert.governorateId] ?? [], alert.areaId);
  const categoryLabel = findLabel(CATEGORY_OPTIONS, alert.categoryId);
  const operationLabel = OPERATION_OPTIONS.find(
    (o) => o.id === alert.operationType?.toLowerCase(),
  )?.label;

  // Title formatting
  let title = '';
  let subtitle = '';

  if (isAuction) {
    title = 'مزادات وزارة العدل';
    const categoryPart = categoryLabel
      ? `مزادات ${categoryLabel}`
      : 'مزادات الأراضي السكنية';
    const locationPart = governorateLabel || areaLabel || 'محافظة العاصمة';
    subtitle = `${categoryPart} - ${locationPart}`;
  } else if (isExchange) {
    const categoryPart = categoryLabel || 'عقار';
    const locationPart = areaLabel || governorateLabel || 'الكويت';
    title = `${categoryPart} للبدل - ${locationPart}`;
  } else {
    const categoryPart = categoryLabel || 'عقار';
    const opPart =
      alert.operationType === 'RENT'
        ? 'للإيجار'
        : alert.operationType === 'SALE'
          ? 'للبيع'
          : operationLabel
            ? `للـ${operationLabel}`
            : 'للإيجار';
    const locationPart = areaLabel || governorateLabel || 'الكويت';
    title = `${categoryPart} ${opPart} - ${locationPart}`;
  }

  // Feature Badges (Chips) for Properties
  const chips: string[] = [];

  if (!isAuction) {
    if (isExchange) {
      if (alert.requestYear || alert.requiredYear) {
        chips.push(`طلب ${alert.requestYear ?? '—'} مع ${alert.requiredYear ?? '—'}`);
      }
      if (areaLabel && governorateLabel) {
        chips.push(`${areaLabel}، ${governorateLabel}`);
      }
    } else {
      if (alert.rentValue) {
        chips.push(`حتى ${alert.rentValue.toLocaleString()} د.ك`);
      } else if (alert.price) {
        chips.push(`${alert.price.toLocaleString()} د.ك`);
      }

      if (alert.rooms) {
        chips.push(`${toArabicNumerals(alert.rooms)} غرف`);
      }

      if (alert.baths) {
        chips.push(`${toArabicNumerals(alert.baths)} حمام`);
      }

      if (alert.areaSize) {
        chips.push(`${alert.areaSize} م²`);
      }

      if (alert.amenities && alert.amenities.length > 0) {
        alert.amenities.forEach((amenityId) => {
          const label = AMENITY_LABELS[amenityId];
          if (label) chips.push(label);
        });
      }
    }
  }

  // Auction date string
  const auctionDateRange =
    isAuction && (alert.startDate || alert.endDate)
      ? `${alert.endDate ? formatAuctionDate(alert.endDate) : ''}${
          alert.startDate && alert.endDate ? ' - ' : ''
        }${alert.startDate ? formatAuctionDate(alert.startDate) : ''}`
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={() => onDeletePress(alert.id)}
      className="mb-3 rounded-xl border border-[#D7D7D7] bg-white pt-4 shadow-none"
    >
      {/* Top Row: [Toggle] (Left) <---> [Details] (Center) <---> [Icon/Badge] (Right) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        {/* Right Element: Icon / Ministry Emblem */}
        <View style={{ flexShrink: 0 }}>
          {isAuction ? (
            <JusticeMinistryEmblem />
          ) : isExchange ? (
            <ExchangeIcon />
          ) : (
            <PropertyNotificationIcon />
          )}
        </View>

        {/* Center Element: Content & Badges (Aligned Right for Arabic) */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text
            className={`font-cairo-semibold text-sm ${
              isAuction ? 'text-[#111111]' : 'text-[#15304D]'
            }`}
            style={{ writingDirection: "rtl" }}
          >
            {title}
          </Text>

          {isAuction && subtitle ? (
            <Text
              className="mt-1 font-cairo text-xs text-[#111111]"
              style={{ writingDirection: "rtl" }}
            >
              {subtitle}
            </Text>
          ) : null}

          {isAuction && auctionDateRange ? (
            <View className="mt-2 flex-row items-center gap-1.5">
              <Text className="font-cairo text-xs text-[#111111]">
                {auctionDateRange}
              </Text>
              <CalendarIcon />
            </View>
          ) : null}

          {/* Chips for Properties & Exchange */}
          {!isAuction && chips.length > 0 ? (
            <View className="mt-2.5 flex-row flex-wrap gap-1.5">
              {chips.map((chip, idx) => (
                <View
                  key={idx}
                  className="rounded-lg bg-[#F9FAFE] px-2.5 py-1"
                >
                  <Text className="font-almarai text-xs text-[#111111]">
                    {chip}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Left Element: Toggle Switch & Options */}
        <View style={{ flexShrink: 0, alignItems: 'flex-start', gap: 6 }}>
          <CustomToggle isOn={isActive} onToggle={handleToggle} />
        </View>
      </View>

      {/* Bottom Footer: [Status text] (Left) <---> [Green Dot + Relative Time] (Right) */}
      <View
        style={{
          borderTopWidth: 0.5,
          borderTopColor: '#D7D7D7',
          marginTop: 12,
          paddingHorizontal: 16,
          height: 48,
          flexDirection: isRTL ? 'row' : 'row-reverse',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Right Element: Relative Match Time + Active Green Dot */}
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-[#018B1B]" />
          <Text className="font-cairo-medium text-[13px] text-[#111111]">
            {formatRelativeMatchTime(alert.createdAt)}
          </Text>
        </View>

        {/* Left Element: Status Label */}
        <Text
          className={`font-cairo-medium text-[13px] ${
            isActive ? 'text-[#15304D]' : 'text-[#9C1E28]'
          }`}
        >
          {isActive ? 'تم تفعيل التنبيهات' : 'تم ايقاف التنبيهات'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
