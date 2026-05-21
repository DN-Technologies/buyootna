import React from 'react';
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
