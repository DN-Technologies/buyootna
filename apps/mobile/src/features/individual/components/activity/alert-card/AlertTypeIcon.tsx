import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { AlertItem } from '@/shared/api/alerts.service';

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

// Auctions show the Ministry of Justice logo; property alerts show an
// exchange or bell icon depending on the operation.
export default function AlertTypeIcon({ alert }: { alert: AlertItem }) {
  if (alert.type === 'AUCTIONS') return <JusticeMinistryEmblem />;
  if (alert.operationType === 'EXCHANGE') return <ExchangeIcon />;
  return <PropertyNotificationIcon />;
}
