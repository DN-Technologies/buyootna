import { Image, View } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  testID?: string;
}

/**
 * Fills its parent container with either the given photo or, when none has
 * been uploaded yet, the Buyootna logo -- not a third-party placeholder
 * service (an unnecessary network dependency for something that should
 * always render, and the actual cause of the plain gray box showing up
 * whenever that request was slow/blocked/down). Caller controls
 * size/rounding/border via the wrapping View, same as a raw <Image> before.
 */
export default function Avatar({ uri, testID }: AvatarProps) {
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
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2F7',
      }}
    >
      <Image
        source={require('@/assets/images/buyootna-icon.png')}
        style={{ width: '55%', height: '55%' }}
        resizeMode="contain"
      />
    </View>
  );
}
