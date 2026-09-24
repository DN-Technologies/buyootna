import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function NotificationHomeIcon({
  size = 24,
  color = '#111111',
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 25 26"
      fill="none"
    >
      <Path
        d="M9.484 22.8327H6.194C4.982 22.8327 4 21.8507 4 20.6387V14.1847C4.00074 13.7145 4.10194 13.2499 4.29682 12.8221C4.49171 12.3942 4.77578 12.0129 5.13 11.7037L11.06 6.53869C11.4593 6.19132 11.9707 6 12.5 6C13.0293 6 13.5407 6.19132 13.94 6.53869L19.87 11.7047C20.2241 12.0138 20.5081 12.3949 20.703 12.8226C20.8978 13.2503 20.9991 13.7147 21 14.1847V20.6387C21 21.2204 20.769 21.7783 20.3577 22.1897C19.9465 22.6012 19.3887 22.8324 18.807 22.8327H15.79V16.2517C15.79 15.3437 15.054 14.6067 14.145 14.6067H11.13C10.221 14.6067 9.485 15.3437 9.485 16.2517L9.484 22.8327ZM9.484 22.8327H15.791"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </Svg>
  );
}
