import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, View } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  testID?: string;
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
export default function Avatar({ uri, testID }: AvatarProps) {
  // The icon scales with whatever size the caller gives the avatar
  const [iconSize, setIconSize] = useState(0);

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
        backgroundColor: '#F1F5F9',
      }}
    >
      {iconSize > 0 && <Feather name="user" size={iconSize} color="#94A3B8" />}
    </View>
  );
}
