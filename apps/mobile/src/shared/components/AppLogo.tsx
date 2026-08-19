import { Image, ImageStyle, StyleProp } from 'react-native';

export interface AppLogoProps {
  width?: number;
  height?: number;
  variant?: 'icon' | 'horizontal' | 'stacked';
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  dark?: boolean;
  fill?: string;
}

export default function AppLogo({
  width = 100,
  height = 100,
  variant = 'icon',
  style,
  resizeMode = 'contain',
}: AppLogoProps) {
  const source =
    variant === 'horizontal'
      ? require('@/assets/images/buyootna-logo.png')
      : variant === 'stacked'
        ? require('@/assets/images/buyootna-logo-stacked.png')
        : require('@/assets/images/buyootna-icon.png');

  return (
    <Image
      source={source}
      style={[{ width, height }, style]}
      resizeMode={resizeMode}
    />
  );
}
