import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface ExchangeYearsProps {
  requestYear?: number | null;
  requiredYear?: number | null;
  className?: string;
}

/** True when the ad carries an exchange's two years. */
export const hasExchangeYears = (
  requestYear?: number | null,
  requiredYear?: number | null,
) => Boolean(requestYear && requiredYear);

function Year({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row items-center gap-1">
      <Feather name="calendar" size={13} color="#6B6A6A" />
      <Text className="font-cairo-medium text-xs leading-[20px] text-[#6B6A6A]">
        {label}
      </Text>
      <Text className="font-cairo-bold text-sm leading-[20px] text-[#15304D]">
        {value}
      </Text>
    </View>
  );
}

/** An exchange ad's سنة الطلب and السنة المطلوبة, as shown on its card. */
export default function ExchangeYears({
  requestYear,
  requiredYear,
  className = '',
}: ExchangeYearsProps) {
  if (!hasExchangeYears(requestYear, requiredYear)) return null;
  return (
    <View
      testID="exchange-years"
      className={`flex-row flex-wrap items-center gap-x-4 gap-y-1 ${className}`}
    >
      <Year label="سنة الطلب" value={requestYear!} />
      <Year label="السنة المطلوبة" value={requiredYear!} />
    </View>
  );
}
