import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function NotificationReceiptIcon({
  size = 24,
  color = '#111111',
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 19 19"
      fill="none"
    >
      <Path
        d="M16.5 18.5H4.5C3.43913 18.5 2.42172 18.0786 1.67157 17.3284C0.921427 16.5783 0.5 15.5609 0.5 14.5V2.5C0.5 1.96957 0.710714 1.46086 1.08579 1.08579C1.46086 0.710714 1.96957 0.5 2.5 0.5H12.5C13.0304 0.5 13.5391 0.710714 13.9142 1.08579C14.2893 1.46086 14.5 1.96957 14.5 2.5V15.5C14.5 17.157 14.843 18.5 16.5 18.5Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
      />
      <Path
        d="M18.5 7.5C18.5 6.96957 18.2893 6.46086 17.9142 6.08579C17.5391 5.71071 17.0304 5.5 16.5 5.5H14.5V16C14.5 17.38 15.12 18.5 16.5 18.5C17.88 18.5 18.5 17.38 18.5 16V7.5Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
      />
      <Path
        d="M10.5 8.5H4.5M10.5 4.5H4.5M7.5 12.5H4.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={1.3}
      />
    </Svg>
  );
}
