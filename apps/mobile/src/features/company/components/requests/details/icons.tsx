import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface DetailIconProps {
  size?: number;
  color?: string;
}

// 1. Back Chevron Icon (Points to right for RTL back button)
export const BackChevronIcon = ({
  size = 20,
  color = '#111111',
}: DetailIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 2. Three Vertical Dots Menu Icon
export const ThreeDotsMenuIcon = ({
  size = 20,
  color = '#111111',
}: DetailIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={5} r={1.75} fill={color} />
    <Circle cx={12} cy={12} r={1.75} fill={color} />
    <Circle cx={12} cy={19} r={1.75} fill={color} />
  </Svg>
);

// 3. Calendar Clock Publish Time Icon
export const PublishClockIcon = ({
  size = 14,
  color = '#15304D',
}: DetailIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Rect
      x="2"
      y="3"
      width="12"
      height="11"
      rx="2"
      stroke={color}
      strokeWidth={1.2}
    />
    <Path d="M2 6.5H14" stroke={color} strokeWidth={1.2} />
    <Path
      d="M5 1.5V3.5M11 1.5V3.5"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </Svg>
);

// 4. Document / Offer Icon
export const DocumentOfferIcon = ({
  size = 14,
  color = '#15304D',
}: DetailIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M4 2H10L13 5V13C13 13.5523 12.5523 14 12 14H4C3.44772 14 3 13.5523 3 13V3C3 2.44772 3.44772 2 4 2Z"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M6 7H10M6 10H9" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
  </Svg>
);

// 5. Rating Star Icon
export const RatingStarIcon = ({
  size = 12,
  color = '#F59E0B',
}: DetailIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

// 6. Maximize / Fullscreen Map Icon
export const MaximizeMapIcon = ({
  size = 16,
  color = '#FFFFFF',
}: DetailIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 7. Client Chat Icon
export const ClientChatIcon = ({
  size = 16,
  color = '#B28648',
}: DetailIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M17 9.5C17 13.0899 13.866 16 10 16C8.75549 16 7.58552 15.6987 6.57597 15.168L3 16.5L4.47055 13.3138C3.55184 12.2471 3 10.9327 3 9.5C3 5.91015 6.13401 3 10 3C13.866 3 17 5.91015 17 9.5Z"
      stroke={color}
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ClientPhoneIcon = ({
  size = 16,
  color = '#15304D',
}: DetailIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.62 7.81C5.06 10.65 7.35 12.94 10.19 14.38L12.4 12.17C12.67 11.9 13.07 11.82 13.42 11.93C14.54 12.3 15.75 12.5 17 12.5C17.55 12.5 18 12.95 18 13.5V17C18 17.55 17.55 18 17 18C8.72 18 2 11.28 2 3C2 2.45 2.45 2 3 2H6.5C7.05 2 7.5 2.45 7.5 3C7.5 4.25 7.7 5.46 8.07 6.58C8.18 6.93 8.1 7.33 7.83 7.6L5.62 9.81"
      stroke={color}
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
