import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
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
  ChatTabIcon,
  CompaniesTabIcon,
  HomeIcon,
  MenuIcon,
  OrdersIcon,
  PropertiesTabIcon,
} from '@/assets/icons/tab/index';
import { useTabBarHeight } from '@/shared/hooks/useTabBarHeight';

interface CustomTabBarProps extends BottomTabBarProps {
  onOpenPlusSheet: () => void;
}

// The full set of real tab screens across all three account types (plus
// the special "add" center-button route). Detail/form screens (edit
// profile, add-service, add-project, etc.) are reachable via router.push()
// without being declared as Tabs.Screen entries in their (group)/_layout.tsx
// -- but React Navigation still invokes this component's `tabBar` render
// prop for them regardless of that (confirmed live: neither leaving them
// undeclared, nor nesting them under their own Stack-typed _layout.tsx,
// stopped it). Explicitly refusing to render for anything not in this
// whitelist is what actually guarantees the floating bar never shows on
// top of those screens, independent of whatever routing-nesting behavior
// led to this component being invoked in the first place.
const KNOWN_TAB_ROUTE_NAMES = new Set([
  'home',
  'company-home',
  'office-home',
  'companies',
  'activity',
  'company-requests',
  'office-properties',
  'company-chats',
  'office-chats',
  'more',
  'company-more',
  'office-more',
  'add',
]);

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  onOpenPlusSheet,
}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { tabBarHeight: BAR_HEIGHT } = useTabBarHeight();

  // See KNOWN_TAB_ROUTE_NAMES above for why this check exists at all.
  const activeRouteName = state.routes[state.index]?.name;
  if (!KNOWN_TAB_ROUTE_NAMES.has(activeRouteName)) {
    return null;
  }

  // iPad constraint: floating centered tab bar
  const isTablet = windowWidth >= 768;
  const barWidth = isTablet ? 500 : windowWidth;
  const leftOffset = isTablet ? (windowWidth - barWidth) / 2 : 0;

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
      className={`absolute bottom-0 z-50 ${isTablet ? 'overflow-hidden rounded-t-[32px]' : ''}`}
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
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: barWidth,
          height: BAR_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 16,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const itemWidth = (barWidth - 70) / 4;

          if (route.name === 'add') {
            return <View key={route.key} style={{ width: 70, height: '100%' }} />;
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
          let badgeCount = 0;

          switch (route.name) {
            case 'home':
            case 'company-home':
            case 'office-home':
              IconComponent = HomeIcon;
              label = 'الرئيسية';
              break;
            case 'companies':
              IconComponent = CompaniesTabIcon;
              label = 'شركات';
              break;
            case 'activity':
              IconComponent = ActivityIcon;
              label = 'نشاطي';
              break;
            case 'company-requests':
              IconComponent = OrdersIcon;
              label = 'الطلبات';
              break;
            case 'office-properties':
              IconComponent = PropertiesTabIcon;
              label = 'العقارات';
              break;
            case 'company-chats':
            case 'office-chats':
              IconComponent = ChatTabIcon;
              label = 'المحادثات';
              badgeCount = 2; // Can be linked to useChatStore unread count
              break;
            case 'more':
            case 'company-more':
            case 'office-more':
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
              style={{
                width: itemWidth,
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View className="relative items-center justify-center">
                <IconComponent size={22} color={iconColor} />
                {badgeCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      backgroundColor: '#EF4444',
                      borderRadius: 10,
                      minWidth: 16,
                      height: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 3,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 9,
                        fontFamily: 'Cairo_700Bold',
                        lineHeight: 12,
                      }}
                    >
                      {badgeCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontFamily: 'Cairo_700Bold',
                  fontSize: 10,
                  color: isFocused ? '#FFD084' : '#FFFFFF',
                  marginTop: 2,
                  textAlign: 'center',
                }}
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
