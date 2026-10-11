import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import {
  BuildOutlineIcon,
  OrderOutlineIcon,
  PinOutlineIcon,
  WalletOutlineIcon,
} from '@/assets/icons/activity';
import {
  CardDivider,
  RequestCard,
} from '@/features/individual/components/request-details/RequestCard';

interface InfoCellProps {
  label: string;
  value: string;
  icon: ReactNode;
  muted?: boolean;
  testID?: string;
}

function InfoCell({ label, value, icon, muted, testID }: InfoCellProps) {
  return (
    <View className="flex-row items-start gap-[6px]">
      <View className="h-6 w-6 items-center justify-center rounded-[100px] bg-[#DEE3E8]">
        {icon}
      </View>
      <View className="flex-1 gap-[6px]">
        <Text
          className="font-cairo-semibold text-[13px] leading-[16px]"
          style={{ color: muted ? '#A0A0A0' : '#6B6A6A', writingDirection: 'rtl' }}
        >
          {label}
        </Text>
        <Text
          testID={testID}
          className="font-cairo-semibold text-[13px] leading-[18px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

interface RequestInfoCardProps {
  requestNumber: string;
  date: string;
  priceRange?: string | null;
  service?: string | null;
  area: string;
  muted?: boolean;
}

/** رقم الطلب / تاريخ الطلب / نوع الخدمة / نطاق السعر / المنطقة */
export default function RequestInfoCard({
  requestNumber,
  date,
  priceRange,
  service,
  area,
  muted,
}: RequestInfoCardProps) {
  return (
    <RequestCard gap={16}>
      <View className="flex-row items-center gap-[27px]">
        <View className="flex-1">
          <InfoCell
            label="رقم الطلب"
            value={requestNumber}
            muted={muted}
            testID="request-info-number"
            icon={
              <Text className="font-cairo-semibold text-[9px] leading-[12px] text-[#15304D]">
                #
              </Text>
            }
          />
        </View>
        <View className="w-[157px]">
          <InfoCell
            label="تاريخ الطلب"
            value={date}
            muted={muted}
            icon={<WalletOutlineIcon size={11.3} />}
          />
        </View>
      </View>

      <CardDivider />

      <View className="flex-row items-center gap-[27px]">
        <View className="flex-1">
          <InfoCell
            label="نوع الخدمة"
            value={service || '-'}
            muted={muted}
            icon={<BuildOutlineIcon />}
          />
        </View>
        <InfoCell
          label="نطاق السعر"
          value={priceRange || '-'}
          muted={muted}
          icon={<OrderOutlineIcon size={12.13} />}
        />
      </View>

      <CardDivider />

      <InfoCell
        label="المنطقة"
        value={area || '-'}
        muted={muted}
        icon={<PinOutlineIcon size={12.67} />}
      />
    </RequestCard>
  );
}
