import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface RequestIconProps {
  size?: number;
  color?: string;
}

// 1. Search Icon (Matching Figma search bar icon)
export const SearchIcon = ({ size = 20, color = '#989898' }: RequestIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 21L16.65 16.65"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 2. Filter / Sliders Button Icon (Matching Figma circular filter button)
export const FilterSlidersIcon = ({
  size = 20,
  color = '#111111',
}: RequestIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.333 5h8.334M15 5h1.667M3.333 10h3.334M10 10h6.667M3.333 15h10M16.667 15h0"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Circle cx={13.333} cy={5} r={1.667} stroke={color} strokeWidth={1.5} />
    <Circle cx={8.333} cy={10} r={1.667} stroke={color} strokeWidth={1.5} />
    <Circle cx={15} cy={15} r={1.667} stroke={color} strokeWidth={1.5} />
  </Svg>
);

// 3. Location Pin Icon (Matching Figma card location item)
export const LocationPinSmallIcon = ({
  size = 14,
  color = '#6B6A6A',
}: RequestIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Path
      d="M7 1.75C4.92893 1.75 3.25 3.42893 3.25 5.5C3.25 8.3125 7 12.25 7 12.25C7 12.25 10.75 8.3125 10.75 5.5C10.75 3.42893 9.07107 1.75 7 1.75Z"
      stroke={color}
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={7} cy={5.5} r={1.5} stroke={color} strokeWidth={1.1} />
  </Svg>
);

// 4. Wallet Icon (Matching Figma card price item)
export const WalletSmallIcon = ({
  size = 14,
  color = '#6B6A6A',
}: RequestIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Rect
      x="1.5"
      y="2.5"
      width="11"
      height="9"
      rx="1.5"
      stroke={color}
      strokeWidth={1.1}
    />
    <Path d="M1.5 5.5H12.5" stroke={color} strokeWidth={1.1} />
    <Circle cx={9.5} cy={8.5} r={0.8} fill={color} />
  </Svg>
);

// 5. Paperclip / Attach Icon (Matching Figma card attachment item)
export const PaperclipSmallIcon = ({
  size = 14,
  color = '#6B6A6A',
}: RequestIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Path
      d="M12.495 6.46383L6.92625 12.0326C5.51001 13.4488 3.2125 13.4488 1.79626 12.0326C0.380018 10.6163 0.380018 8.31883 1.79626 6.90259L7.36501 1.33384C8.30917 0.389674 9.84084 0.389674 10.785 1.33384C11.7292 2.27801 11.7292 3.80968 10.785 4.75384L5.21626 10.3226C4.74417 10.7947 3.97834 10.7947 3.50625 10.3226C3.03417 9.8505 3.03417 9.08468 3.50625 8.61259L8.52251 3.59634"
      stroke={color}
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
