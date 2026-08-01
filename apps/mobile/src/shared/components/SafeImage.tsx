import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import { Image as RNImage, UIManager } from 'react-native';

export function SafeImage(props: ExpoImageProps) {
  const isAvailable = Boolean(
    UIManager.getViewManagerConfig && UIManager.getViewManagerConfig('ExpoImage')
  );

  if (!isAvailable) {
    return (
      <RNImage
        source={props.source as any}
        style={props.style as any}
        resizeMode={(props.contentFit as any) || 'cover'}
      />
    );
  }

  return <ExpoImage {...props} />;
}

export default SafeImage;
