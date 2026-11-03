import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { LETTER_AVATAR, nameInitials } from '@/shared/utils/nameInitials';

interface AvatarProps {
  uri?: string | null;
  testID?: string;
  // Without a photo: the name's letters instead of the person icon
  name?: string | null;
}

/**
 * Fills its parent container with either the given photo or, when none has
 * been uploaded yet, a person icon -- the same one as the avatar pill and the
 * profile switcher, for people, companies and offices alike. Drawn locally,
 * never a third-party placeholder service (an unnecessary network dependency
 * that showed a plain gray box whenever that request was slow/blocked/down).
 * Caller controls size/rounding/border via the wrapping View, same as a raw
 * <Image> before.
 */
export default function Avatar({ uri, testID, name }: AvatarProps) {
  // The icon or letters scale with whatever size the caller gives the avatar
  const [iconSize, setIconSize] = useState(0);
  const initials = nameInitials(name);

  if (uri) {
    return (
      <Image
        testID={testID ? `${testID}-photo` : undefined}
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      testID={testID ? `${testID}-fallback` : undefined}
      onLayout={(e) =>
        setIconSize(Math.round(Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height) * 0.5))
      }
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        // The app's gold behind a letter; the neutral grey behind the icon
        backgroundColor: initials ? LETTER_AVATAR.background : '#F1F5F9',
      }}
    >
      {iconSize > 0 &&
        (initials ? (
          <Text
            testID={testID ? `${testID}-initials` : undefined}
            numberOfLines={1}
            style={{
              fontFamily: 'Cairo_700Bold',
              fontSize: Math.round(iconSize * 0.8),
              lineHeight: Math.round(iconSize * 1.4),
              color: LETTER_AVATAR.letter,
              includeFontPadding: false,
            }}
          >
            {initials}
          </Text>
        ) : (
          <Feather name="user" size={iconSize} color="#94A3B8" />
        ))}
    </View>
  );
}
