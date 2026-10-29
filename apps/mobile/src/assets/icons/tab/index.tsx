import Svg, { Path } from 'react-native-svg';

interface TabIconProps {
  color?: string;
  size?: number;
}

export const HomeIcon = ({ color = '#FFFFFF', size = 20 }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M1.95884 11.0113C1.66466 9.09695 1.51757 8.13978 1.87949 7.29123C2.24141 6.44268 3.04437 5.86211 4.6503 4.70097L5.85017 3.83341C7.84792 2.38897 8.8468 1.66675 9.99935 1.66675C11.1519 1.66675 12.1508 2.38897 14.1485 3.83341L15.3484 4.70097C16.9543 5.86211 17.7573 6.44268 18.1192 7.29123C18.4811 8.13978 18.334 9.09695 18.0399 11.0113L17.789 12.6437C17.372 15.3575 17.1634 16.7144 16.1902 17.5239C15.2169 18.3334 13.7941 18.3334 10.9484 18.3334H9.05034C6.20463 18.3334 4.78177 18.3334 3.80851 17.5239C2.83526 16.7144 2.62674 15.3575 2.2097 12.6437L1.95884 11.0113Z"
      stroke={color}
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
    <Path
      d="M8.33203 15L11.6654 15"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SearchIcon = ({ color = '#FFFFFF', size = 20 }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M14.6257 14.9249L16.9923 17.2833M16.6673 9.99992C16.6673 13.6818 13.6825 16.6666 10.0007 16.6666C6.31875 16.6666 3.33398 13.6818 3.33398 9.99992C3.33398 6.31802 6.31875 3.33325 10.0007 3.33325C13.6825 3.33325 16.6673 6.31802 16.6673 9.99992Z"
      stroke={color}
      strokeWidth={0.833333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ActivityIcon = ({
  color = '#FFFFFF',
  size = 20,
}: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M14.166 3.33325H5.83268C4.91221 3.33325 4.16602 4.07944 4.16602 4.99992V15.8333C4.16602 16.7537 4.91221 17.4999 5.83268 17.4999H14.166C15.0865 17.4999 15.8327 16.7537 15.8327 15.8333V4.99992C15.8327 4.07944 15.0865 3.33325 14.166 3.33325Z"
      stroke={color}
      strokeWidth={1.2}
    />
    <Path
      d="M7.5 7.5H12.5M7.5 10.8333H12.5M7.5 14.1667H10.8333"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </Svg>
);

export const MenuIcon = ({ color = '#FFFFFF', size = 20 }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.33398 4.16675H16.6673M3.33398 10.0001H16.6673M3.33398 15.8334H16.6673"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const AddIcon = ({ color = '#FFFFFF', size = 32 }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M25 16C25 16.1989 24.921 16.3897 24.7803 16.5303C24.6397 16.671 24.4489 16.75 24.25 16.75H16.75V24.25C16.75 24.4489 16.671 24.6397 16.5303 24.7803C16.3897 24.921 16.1989 25 16 25C15.8011 25 15.6103 24.921 15.4697 24.7803C15.329 24.6397 15.25 24.4489 15.25 24.25V16.75H7.75C7.55109 16.75 7.36032 16.671 7.21967 16.5303C7.07902 16.3897 7 16.1989 7 16C7 15.8011 7.07902 15.6103 7.21967 15.4697C7.36032 15.329 7.55109 15.25 7.75 15.25H15.25V7.75C15.25 7.55109 15.329 7.36032 15.4697 7.21967C15.6103 7.07902 15.8011 7 16 7C16.1989 7 16.3897 7.07902 16.5303 7.21967C16.671 7.36032 16.75 7.55109 16.75 7.75V15.25H24.25C24.4489 15.25 24.6397 15.329 24.7803 15.4697C24.921 15.6103 25 15.8011 25 16Z"
      fill={color}
    />
  </Svg>
);

export const OrdersIcon = ({ color = '#FFFFFF', size = 20 }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M5 2.5H15C15.9205 2.5 16.6667 3.24619 16.6667 4.16667V15.8333C16.6667 16.7538 15.9205 17.5 15 17.5H5C4.07953 17.5 3.33333 16.7538 3.33333 15.8333V4.16667C3.33333 3.24619 4.07953 2.5 5 2.5Z"
      stroke={color}
      strokeWidth={1.2}
    />
    <Path
      d="M6.66602 6.66675H13.3327M6.66602 10H13.3327M6.66602 13.3334H10.0007"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </Svg>
);

// المحادثات tab (Figma nav 9797:22041): a square speech bubble
export const ChatTabIcon = ({ color = '#FFFFFF', size = 20 }: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M15.9231 4H4.07694C3.79132 4 3.5174 4.11414 3.31544 4.3173C3.11348 4.52047 3.00002 4.79602 3.00002 5.08333V15.9167C2.99878 16.1232 3.05687 16.3258 3.16732 16.5C3.27777 16.6741 3.43587 16.8125 3.62261 16.8984C3.76492 16.9651 3.91996 16.9998 4.07694 17C4.32975 16.9994 4.57417 16.9087 4.76684 16.7441L4.7729 16.7393L6.97117 14.8333H15.9231C16.2087 14.8333 16.4826 14.7192 16.6846 14.516C16.8865 14.3129 17 14.0373 17 13.75V5.08333C17 4.79602 16.8865 4.52047 16.6846 4.3173C16.4826 4.11414 16.2087 4 15.9231 4ZM15.9231 13.75H6.76925C6.63995 13.7501 6.515 13.7969 6.41723 13.882L4.07694 15.9167V5.08333H15.9231V13.75Z"
      fill={color}
    />
  </Svg>
);

export const CompaniesTabIcon = ({
  color = '#FFFFFF',
  size = 20,
}: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M6.66667 17.5V4.16667C6.66667 3.24619 7.41286 2.5 8.33333 2.5H11.6667C12.5871 2.5 13.3333 3.24619 13.3333 4.16667V17.5"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.33333 17.5V8.33333C3.33333 7.41286 4.07953 6.66667 5 6.66667H6.66667"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.3333 6.66667H15C15.9205 6.66667 16.6667 7.41286 16.6667 8.33333V17.5"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.5 17.5H17.5"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
    <Path
      d="M9.16667 5.83333H10.8333M9.16667 8.75H10.8333M9.16667 11.6667H10.8333"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </Svg>
);

export const PropertiesTabIcon = ({
  color = '#FFFFFF',
  size = 20,
}: TabIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.33398 17.5V4.16667C3.33398 3.24619 4.08018 2.5 5.00065 2.5H14.9993C15.9198 2.5 16.666 3.24619 16.666 4.16667V17.5"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
    <Path
      d="M7.5 17.5V11.6667C7.5 10.7462 8.24619 10 9.16667 10H10.8333C11.7538 10 12.5 10.7462 12.5 11.6667V17.5"
      stroke={color}
      strokeWidth={1.2}
    />
    <Path
      d="M7.5 5.83325H12.5"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </Svg>
);

// العقارات tab (Figma nav, mynaui:building): the 20px frame holds the
// building at 8.33% / 18.75% inset
export const BuildingTabIcon = ({
  color = '#FFFFFF',
  size = 20,
}: TabIconProps) => (
  <Svg width={size} height={size} viewBox="-3.25 -1.1667 20 20" fill="none">
    <Path
      d="M9 0.5C10.4 0.5 11.1 0.5 11.635 0.783333C12.1094 1.03622 12.4918 1.4326 12.7275 1.91583C13 2.47 13 3.19583 13 4.64833V13.0183C13 14.4708 13 15.1967 12.7275 15.7517C12.4918 16.2349 12.1094 16.6313 11.635 16.8842C11.1 17.1667 10.4 17.1667 9 17.1667H4.5C3.1 17.1667 2.4 17.1667 1.865 16.8833C1.39055 16.6304 1.00817 16.2341 0.7725 15.7508C0.5 15.1967 0.5 14.4708 0.5 13.0183V4.64833C0.5 3.19583 0.5 2.47 0.7725 1.915C1.00832 1.43208 1.39068 1.03601 1.865 0.783333C2.4 0.5 3.1 0.5 4.5 0.5H9Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4.66667 16.3333V11.75C4.66667 11.308 4.84226 10.884 5.15482 10.5715C5.46738 10.2589 5.89131 10.0833 6.33333 10.0833H7.16667C7.60869 10.0833 8.03262 10.2589 8.34518 10.5715C8.65774 10.884 8.83333 11.308 8.83333 11.75V16.3333M5.08333 3.83333H3.41667M5.08333 7.16667H3.41667M10.0833 3.83333H8.41667M10.0833 7.16667H8.41667"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
