import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import AlertCardFooter from '@/features/individual/components/activity/alerts/alert-card/AlertCardFooter';
import AlertChips from '@/features/individual/components/activity/alerts/alert-card/AlertChips';
import AlertToggle from '@/features/individual/components/activity/alerts/alert-card/AlertToggle';
import AlertTypeIcon from '@/features/individual/components/activity/alerts/alert-card/AlertTypeIcon';
import CalendarIcon from '@/features/individual/components/activity/alerts/alert-card/CalendarIcon';
import {
  getAlertChips,
  getAlertTitle,
  getAuctionDateRange,
} from '@/features/individual/utils/alertCard';
import { AlertItem } from '@/shared/api/alerts.service';

export interface AlertListItemProps {
  alert: AlertItem;
  isActive?: boolean;
  onToggleActive?: (id: string, nextActive: boolean) => void;
  onDeletePress: (id: string) => void;
  onPress?: (id: string) => void;
  showCancelAction?: boolean;
  onCancelPress?: (id: string) => void;
}

export default function AlertListItem({
  alert,
  isActive: controlledIsActive,
  onToggleActive,
  onDeletePress,
  onPress,
  showCancelAction,
  onCancelPress,
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
  const { title, subtitle } = getAlertTitle(alert);
  const chips = getAlertChips(alert);
  const auctionDateRange = getAuctionDateRange(alert);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress ? () => onPress(alert.id) : undefined}
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
          <AlertTypeIcon alert={alert} />
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
          {!isAuction ? <AlertChips chips={chips} /> : null}
        </View>

        {/* Left Element: Toggle Switch & Options */}
        <View style={{ flexShrink: 0, alignItems: 'flex-start', gap: 6 }}>
          <AlertToggle isOn={isActive} onToggle={handleToggle} />
        </View>
      </View>

      <AlertCardFooter
        lastMatchedAt={alert.lastMatchedAt}
        isActive={isActive}
        createdAt={alert.createdAt}
        showCancelAction={showCancelAction}
        onCancelPress={onCancelPress ? () => onCancelPress(alert.id) : undefined}
      />
    </TouchableOpacity>
  );
}
