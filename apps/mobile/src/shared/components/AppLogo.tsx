import { BuyootnaLogo } from '@/assets/icons/index';

export default function AppLogo({
  width = 100,
  height = 100,
}: {
  width?: number;
  height?: number;
  fill?: string;
  dark?: boolean;
}) {
  return <BuyootnaLogo width={width} height={height} />;
}
