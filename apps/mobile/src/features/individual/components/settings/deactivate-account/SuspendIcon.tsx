import Svg, { Circle, Path } from 'react-native-svg';

// Suspend / Pause circle icon matching Figma 1684:60314
export default function SuspendIcon({
  color = '#B97500',
  size = 32,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="14" stroke={color} strokeWidth="2" />
      <Path
        d="M13 11V21M19 11V21"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
