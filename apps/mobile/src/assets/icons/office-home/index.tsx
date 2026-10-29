import Svg, { G, Path } from 'react-native-svg';

// Office home (Figma 4494:141157 and its states) -- paths exported from Figma

interface IconProps {
  color?: string;
  size?: number;
}

// The ads upsell card's icon (arcticons:ad-free), on its gold circle
export const AdFreeIcon = ({ color = '#15304D', size = 19.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 19.2 19.2" fill="none">
    <G
      stroke={color}
      strokeWidth={0.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M16.5758 7.75928C17.9434 11.2766 17.5701 14.7042 15.742 15.4151C13.9138 16.1259 11.3231 13.8508 9.95544 10.3335C8.58776 6.81619 8.96106 3.38857 10.7892 2.67772C12.6174 1.96686 15.2081 4.24195 16.5758 7.75928Z" />
      <Path d="M14.8104 15.5324L4.0392 14.9536C3.44539 14.9534 2.87597 14.7174 2.45608 14.2975C2.0362 13.8776 1.80021 13.3082 1.8 12.7144C1.8 12.0968 2.1088 11.4788 2.4948 11.0544L10.1776 3.0628" />
      <Path d="M7.784 15.1464C7.012 15.0692 5.9696 13.8724 5.3132 12.174C4.6572 10.514 4.6184 8.9696 5.0812 8.352M7.9768 15.224C7.9768 16.0344 7.3208 16.652 6.4712 16.652C5.6216 16.652 4.9656 16.0344 4.9656 15.2624V15.0692M15.6208 8.352L11.7988 11.672C12.9188 13.6408 14.3468 14.7992 15.3508 14.4132C16.586 13.9112 16.702 11.2088 15.6208 8.352ZM14.9648 6.8464L11.104 10.2048C11.0593 10.1042 11.0206 10.0011 10.988 9.896C9.83 6.9236 9.946 4.144 11.1812 3.642C12.2624 3.256 13.8064 4.6464 14.9648 6.8464Z" />
    </G>
  </Svg>
);

// An office card's ads count («37 عقار», lsicon:building-outline)
export const BuildingOutlineIcon = ({
  color = '#6B6A6A',
  size = 16,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M4 11H5M6 11H7M6 8H7M4 8H5M4 5H5M6 5H7M13.5 13.5H2.5V2.5H8.5V7.5H13.5V13.5ZM8.5 9.5H11.5V13.5H8.5V9.5Z"
      stroke={color}
      strokeWidth={0.933333}
    />
  </Svg>
);
