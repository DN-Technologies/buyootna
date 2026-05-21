import { Image } from 'expo-image';

export default function AppLogo({
  width = 100,
  height = 100,
  fill,
  dark = false,
}: {
  width?: number;
  height?: number;
  fill?: string;
  dark?: boolean;
}) {
  return (
    <Image
      source={
        dark
          ? require('@/assets/icons/buyootna-logo-dark.svg')
          : require('@/assets/icons/buyootna-logo.svg')
      }
      style={{ width, height, tintColor: fill }}
      contentFit="contain"
    />
  );
}
