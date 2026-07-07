import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  ActivityIcon,
  AddIcon,
  HomeIcon,
  MenuIcon,
  SearchIcon,
} from '@/assets/icons/tab/index';

interface CustomTabBarProps extends BottomTabBarProps {
  onOpenPlusSheet: () => void;
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  onOpenPlusSheet,
}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  // iPad constraint: floating centered tab bar
  const isTablet = windowWidth >= 768;
  const barWidth = isTablet ? 500 : windowWidth;
  const leftOffset = isTablet ? (windowWidth - barWidth) / 2 : 0;

  // Base height + safe area for iPhone
  const BAR_HEIGHT = 60 + (Platform.OS === 'ios' ? insets.bottom : 16);

  // SVG Math
  const center = barWidth / 2;
  const curveWidth = 45;
  const curveDepth = 55;

  const path = `
    M 0 0
    L ${center - curveWidth - 22} 0
    C ${center - curveWidth + 10} 0, ${center - curveWidth + 5} ${curveDepth}, ${center} ${curveDepth}
    C ${center + curveWidth - 5} ${curveDepth}, ${center + curveWidth - 10} 0, ${center + curveWidth + 22} 0
    L ${barWidth} 0
    L ${barWidth} ${BAR_HEIGHT}
    L 0 ${BAR_HEIGHT}
    Z
  `;

  const addRouteIndex = state.routes.findIndex((r: any) => r.name === 'add');
  const addRoute = state.routes[addRouteIndex];

  const onAddPress = () => {
    onOpenPlusSheet();
  };

  return (
    <View
      className={`absolute bottom-0 z-50 ${isTablet ? 'rounded-t-[32px] overflow-hidden' : ''}`}
      style={{
        width: barWidth,
        left: leftOffset,
        height: BAR_HEIGHT,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      }}
    >
      {/* 1. Background Curve */}
      <Svg width={barWidth} height={BAR_HEIGHT} className="absolute top-0">
        <Path d={path} fill="#15304D" />
      </Svg>

      {/* 2. Standard Tab Icons */}
      <View
        className="absolute h-full w-full flex-row items-center justify-between px-4"
        style={{
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 16,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          if (route.name === 'add') {
            return <View key={route.key} style={{ width: 70 }} />;
          }

          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let IconComponent = HomeIcon;
          let label = '';

          switch (route.name) {
            case 'home':
              IconComponent = HomeIcon;
              label = 'الرئيسية';
              break;
            case 'explore':
              IconComponent = SearchIcon;
              label = 'استكشف';
              break;
            case 'activity':
              IconComponent = ActivityIcon;
              label = 'نشاطي';
              break;
            case 'more':
              IconComponent = MenuIcon;
              label = 'المزيد';
              break;
          }

          const iconColor = isFocused ? '#FFD084' : '#FFFFFF';

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              className="flex-1 items-center justify-center space-y-1"
            >
              <IconComponent size={22} color={iconColor} />
              <Text
                className={`font-cairo-bold text-[10px] ${isFocused ? 'text-[#FFD084]' : 'text-white'}`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Absolute Floating Center Button */}
      {addRoute && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddPress}
          className="absolute items-center justify-center rounded-full bg-[#15304D]"
          style={{
            width: 60,
            height: 60,
            left: barWidth / 2 - 30,
            top: -22,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        >
          <AddIcon
            size={34}
            color={state.index === addRouteIndex ? '#FFD084' : '#FFFFFF'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
