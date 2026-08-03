import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import { Image as RNImage, UIManager } from 'react-native';

export function SafeImage(props: ExpoImageProps & { resizeMode?: any }) {
  const isAvailable = Boolean(
    UIManager.getViewManagerConfig && UIManager.getViewManagerConfig('ExpoImage')
  );

  if (!isAvailable) {
    const { contentFit, resizeMode, transition, source, style, ...rest } = props;
    const mode = (contentFit || resizeMode || 'cover') as any;
    return (
      <RNImage
        {...(rest as any)}
        source={source as any}
        style={style as any}
        resizeMode={mode}
      />
    );
  }

  return <ExpoImage {...props} />;
}

export default SafeImage;
