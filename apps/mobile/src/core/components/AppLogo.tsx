import { Image } from "expo-image";

export default function AppLogo({
  width = 100,
  height = 100,
  fill,
}: {
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <Image
      source={require("@/assets/icons/buyootna-logo.svg")}
      style={{ width, height, tintColor: fill }}
      contentFit="contain"
    />
  );
}
