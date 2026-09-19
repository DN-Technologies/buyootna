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

// 8. Client WhatsApp Icon
export const ClientWhatsAppIcon = ({
  size = 16,
  color = '#60D669',
}: DetailIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.5 14.38C17.22 14.24 15.86 13.57 15.61 13.48C15.35 13.38 15.16 13.34 14.98 13.62C14.79 13.9 14.26 14.56 14.1 14.74C13.94 14.93 13.78 14.95 13.5 14.81C13.22 14.67 12.33 14.38 11.27 13.43C10.45 12.7 9.89 11.79 9.73 11.51C9.57 11.23 9.71 11.08 9.85 10.94C9.98 10.81 10.13 10.61 10.27 10.45C10.41 10.29 10.46 10.17 10.55 9.99C10.64 9.8 10.6 9.64 10.53 9.5C10.46 9.36 9.9 7.99 9.67 7.43C9.44 6.89 9.21 6.96 9.04 6.96C8.88 6.95 8.7 6.95 8.51 6.95C8.32 6.95 8.02 7.02 7.76 7.3C7.51 7.58 6.79 8.25 6.79 9.63C6.79 11.01 7.8 12.34 7.94 12.53C8.08 12.72 9.92 15.55 12.73 16.76C13.4 17.05 13.92 17.22 14.33 17.35C15 17.56 15.64 17.53 16.14 17.46C16.7 17.38 17.86 16.76 18.1 16.08C18.34 15.4 18.34 14.82 18.27 14.7C18.2 14.58 18.01 14.51 17.5 14.38Z"
      fill={color}
    />
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.58 3.39 17.07L2.11 21.75L6.92 20.49C8.37 21.31 10.04 21.78 11.82 21.8L12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20.18C10.42 20.18 8.94 19.72 7.67 18.92L7.37 18.73L4.47 19.49L5.25 16.66L5.05 16.34C4.18 14.96 3.72 13.36 3.72 11.7C3.72 7.13 7.43 3.42 12 3.42C16.57 3.42 20.28 7.13 20.28 11.7C20.28 16.27 16.57 20.18 12 20.18Z"
      fill={color}
    />
  </Svg>
);

// 9. Client Phone Call Icon
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
