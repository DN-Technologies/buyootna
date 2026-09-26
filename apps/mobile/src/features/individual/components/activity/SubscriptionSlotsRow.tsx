import { StyleSheet, Text, View } from 'react-native';

import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';

interface SubscriptionInfo {
  goldRemaining: number;
  silverRemaining: number;
  normalRemaining: number;
}

interface SubscriptionSlotsRowProps {
  subscription?: SubscriptionInfo;
}

export default function SubscriptionSlotsRow({ subscription }: SubscriptionSlotsRowProps) {
  return (
    <View style={styles.container}>
      {/* Normal slot card */}
      <View style={styles.cardNormal}>
        <Text className="font-cairo-bold text-[22px] leading-[30px] text-[#111111] mb-0.5">
          {subscription?.normalRemaining ?? 1}
        </Text>
        <Text className="font-cairo text-[13px] leading-[18px] text-[#6B6A6A]">
          عادي
        </Text>
      </View>

      {/* Silver slot card */}
      <View style={styles.cardNormal}>
        <Text className="font-cairo-bold text-[22px] leading-[30px] text-[#111111] mb-0.5">
          {subscription?.silverRemaining ?? 12}
        </Text>
        <Text className="font-cairo text-[13px] leading-[18px] text-[#6B6A6A]">
          فضي
        </Text>
      </View>

      {/* Gold slot card (Active highlighted orange/yellow card) */}
      <View style={styles.cardGoldWrapper}>
        <LinearGradient
          colors={['#FF8D28', '#FACC15']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text className="font-cairo-bold text-[22px] leading-[30px] text-[#111111] mb-0.5">
            {subscription?.goldRemaining ?? 5}
          </Text>
          <Text className="font-cairo-bold text-[13px] leading-[18px] text-[#111111]">
            ذهبي
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  cardNormal: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '30%',
    height: 69,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E2E8F0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  cardGoldWrapper: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '30%',
    height: 69,
    borderRadius: 8,
    shadowColor: '#FF8D28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
