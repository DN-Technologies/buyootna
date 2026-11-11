import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import type { PlansPromo } from '@/shared/api/plans.service';

/** «10%» or «1 د.ك»: what the code takes off. */
export function promoAmount(promo: PlansPromo): string {
  return promo.type === 'PERCENT' ? `${promo.value}%` : `${promo.value} د.ك`;
}

/**
 * «خصم 10% عند استخدامك كود "BYOUTNA10".» at the top of «الباقات» (Figma
 * 10180:55408): the code an admin chose to advertise, while it's usable.
 */
export default function PlansPromoBanner({ promo }: { promo: PlansPromo }) {
  return (
    <View
      testID="plans-promo"
      className="mb-6 flex-row items-center rounded-lg bg-[#F9FAFE] px-3 py-2.5"
      style={{ gap: 8 }}
    >
      <Image
        source={require('@/assets/icons/plans/offer.svg')}
        style={{ width: 20, height: 20 }}
      />
      <Text
        className="flex-1 py-1.5 font-cairo-medium text-[13px] leading-[16px] text-[#15304D]"
        style={{ writingDirection: 'rtl' }}
      >
        {`خصم ${promoAmount(promo)} عند استخدامك كود `}
        <Text className="font-cairo-bold">{`“${promo.code}”`}</Text>
        {'.'}
      </Text>
    </View>
  );
}
