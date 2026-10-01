import { Image } from 'expo-image';
import { ImageStyle, StyleProp } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface LogoProps {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover' | 'fill';
}

export interface IconProps {
  color?: string;
  size?: number;
}

export const BuyootnaLogo = ({
  width = 140,
  height = 75,
  style,
  resizeMode = 'contain',
}: LogoProps) => (
  <Image
    source={require('@/assets/images/buyootna-logo.png')}
    style={[{ width, height }, style]}
    contentFit={resizeMode}
  />
);

// For light backgrounds: the same logo with the "Buyootna" wordmark in navy
// (the plain logo's wordmark is white and vanishes on white screens)
export const BuyootnaLogoDark = ({
  width = 140,
  height = 75,
  style,
  resizeMode = 'contain',
}: LogoProps) => (
  <Image
    source={require('@/assets/images/buyootna-logo-on-light.png')}
    style={[{ width, height }, style]}
    contentFit={resizeMode}
  />
);

export const CompanyLogo = ({
  width = 100,
  height = 64,
  style,
  resizeMode = 'contain',
}: LogoProps) => (
  <Image
    // Stacked logo for light backgrounds (navy wordmark)
    source={require('@/assets/images/buyootna-logo-stacked-on-light.png')}
    style={[{ width, height }, style]}
    contentFit={resizeMode}
  />
);

export const SortIcon = ({ color = '#111111', size = 18 }: IconProps) => (
  <Svg width={size} height={size * (8 / 16)} viewBox="0 0 16 8" fill="none">
    <Path
      d="M12.65 3.85C12.65 3.99587 12.5921 4.13576 12.4889 4.23891C12.3858 4.34205 12.2459 4.4 12.1 4.4H3.3C3.15413 4.4 3.01424 4.34205 2.91109 4.23891C2.80795 4.13576 2.75 3.99587 2.75 3.85C2.75 3.70413 2.80795 3.56424 2.91109 3.46109C3.01424 3.35795 3.15413 3.3 3.3 3.3H12.1C12.2459 3.3 12.3858 3.35795 12.4889 3.46109C12.5921 3.56424 12.65 3.70413 12.65 3.85ZM14.85 0H0.55C0.404131 0 0.264236 0.0579464 0.161091 0.161091C0.0579462 0.264236 0 0.404131 0 0.55C0 0.695869 0.0579462 0.835764 0.161091 0.938909C0.264236 1.04205 0.404131 1.1 0.55 1.1H14.85C14.9959 1.1 15.1358 1.04205 15.2389 0.938909C15.3421 0.835764 15.4 0.695869 15.4 0.55C15.4 0.404131 15.3421 0.264236 15.2389 0.161091C15.1358 0.0579464 14.9959 0 14.85 0ZM9.35 6.6H6.05C5.90413 6.6 5.76424 6.65795 5.66109 6.76109C5.55795 6.86424 5.5 7.00413 5.5 7.15C5.5 7.29587 5.55795 7.43576 5.66109 7.53891C5.76424 7.64205 5.90413 7.7 6.05 7.7H9.35C9.49587 7.7 9.63576 7.64205 9.73891 7.53891C9.84205 7.43576 9.9 7.29587 9.9 7.15C9.9 7.00413 9.84205 6.86424 9.73891 6.76109C9.63576 6.65795 9.49587 6.6 9.35 6.6Z"
      fill={color}
    />
  </Svg>
);
