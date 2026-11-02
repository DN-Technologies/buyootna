import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import type { ProviderStoryRing } from '../hooks/useProviderStoryRing';
import StoryRing from './StoryRing';

interface CompanyLogoAvatarProps {
  name: string;
  // A URL from the API, or a bundled image on the mock cards
  logoUrl?: string | number | null;
  ring?: ProviderStoryRing | null;
  size?: number;
  testID?: string;
}

/**
 * A company's round logo on a card: inside its story ring while it has live
 * stories (tapping that opens them), otherwise plain and part of the card.
 * The same size either way, so a ring never moves the card's layout.
 */
export default function CompanyLogoAvatar({
  name,
  logoUrl,
  ring,
  size = 64,
  testID,
}: CompanyLogoAvatarProps) {
  if (ring) {
    return (
      <StoryRing
        testID={testID}
        author={{
          name,
          logoUrl: typeof logoUrl === 'string' && logoUrl ? logoUrl : null,
        }}
        hasUnseen={ring.hasUnseen}
        partial={ring.partial}
        size={size}
        onPress={ring.onPress}
      />
    );
  }

  return (
    <View
      testID={testID}
      className="items-center justify-center overflow-hidden rounded-full bg-[#DEE3E8]"
      style={{ width: size, height: size }}
    >
      {logoUrl ? (
        <Image
          source={typeof logoUrl === 'string' ? { uri: logoUrl } : logoUrl}
          contentFit="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Text className="font-cairo-bold text-[18px] text-[#15304D]">
          {name.trim().charAt(0)}
        </Text>
      )}
    </View>
  );
}
