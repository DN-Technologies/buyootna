import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  HomeIcon,
  SearchIcon,
  ActivityIcon,
  MenuIcon,
  AddIcon,
} from "../../assets/icons/tab";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Base height + safe area for iPhone
  const BAR_HEIGHT = 75 + (Platform.OS === "ios" ? insets.bottom : 16);

  // SVG Math
  const center = width / 2;
  const curveWidth = 45;
  const curveDepth = 55;

  const path = `
    M 0 0
    L ${center - curveWidth - 22} 0
    C ${center - curveWidth + 10} 0, ${center - curveWidth + 5} ${curveDepth}, ${center} ${curveDepth}
    C ${center + curveWidth - 5} ${curveDepth}, ${center + curveWidth - 10} 0, ${center + curveWidth + 22} 0
    L ${width} 0
    L ${width} ${BAR_HEIGHT}
    L 0 ${BAR_HEIGHT}
    Z
  `;

  // Find the 'add' route to render it separately
  const addRouteIndex = state.routes.findIndex((r) => r.name === "add");
  const addRoute = state.routes[addRouteIndex];

  const onAddPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: addRoute.key,
      canPreventDefault: true,
    });
    if (state.index !== addRouteIndex && !event.defaultPrevented) {
      navigation.navigate(addRoute.name);
    }
  };

  return (
    <View
      className="absolute bottom-0 w-full"
      style={{
        height: BAR_HEIGHT,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      }}
    >
      {/* 1. Background Curve */}
      <Svg width={width} height={BAR_HEIGHT} className="absolute top-0">
        <Path d={path} fill="#15304D" />
      </Svg>

      {/* 2. Standard Tab Icons (Overlapping the SVG) */}
      <View
        className="absolute w-full h-full flex-row items-center justify-between px-2"
        style={{
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
        }}
      >
        {state.routes.map((route, index) => {
          if (route.name === "add") {
            // Leave a blank space exactly where the floating button will go
            return <View key={route.key} style={{ width: 70 }} />;
          }

          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let IconComponent = HomeIcon;
          let label = "";

          switch (route.name) {
            case "home":
              IconComponent = HomeIcon;
              label = "الرئيسية";
              break;
            case "explore":
              IconComponent = SearchIcon;
              label = "استكشف";
              break;
            case "chats":
              IconComponent = ActivityIcon;
              label = "نشاطي";
              break;
            case "profile":
              IconComponent = MenuIcon;
              label = "المزيد";
              break;
          }

          const iconColor = isFocused ? "#FFD084" : "#FFFFFF";

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              className="flex-1 items-center justify-center space-y-1"
            >
              <IconComponent size={24} color={iconColor} />
              <Text
                className={`text-[11px] font-cairo-bold ${isFocused ? "text-[#FFD084]" : "text-white"}`}
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
          className="absolute items-center justify-center bg-[#15304D] rounded-full"
          style={{
            width: 64,
            height: 64,
            left: width / 2 - 32,
            top: -25,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
          }}
        >
          <AddIcon
            size={38}
            color={state.index === addRouteIndex ? "#FFD084" : "#FFFFFF"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
