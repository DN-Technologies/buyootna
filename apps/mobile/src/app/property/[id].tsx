import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CallIcon, ChatIcon, WhatsappIcon } from '@/assets/icons/home/cards';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HEADER_HEIGHT = 350;

export default function PropertyDetailsScreen() {
  // 1. Hook to get the dynamic ID from the URL
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeIndex, setActiveIndex] = useState(0);

  // --- Temporary Mock Data (Will replace with API fetch in later cards) ---
  const mockProperty = {
    id: id,
    type: 'SALE', // Try changing this to 'EXCHANGE' to see the fallback!
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687931-ce8309e0fb73?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
  };

  // For testing the Exchange "No Image" state, uncomment this:
  // mockProperty.images = [];

  // --- Handlers ---
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  return (
    <View className="flex-1 bg-white">
      {/* --- 1. Floating Top Header Actions --- */}
      <View
        className="absolute top-0 z-10 w-full flex-row justify-between px-5"
        style={{
          paddingTop: Math.max(insets.top, 20) + 10,
        }}
      >
        {/* Left Actions: Share & Heart */}
        <View className="flex-row space-x-3 space-x-reverse">
          <TouchableOpacity
            activeOpacity={0.8}
            className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
          >
            <Feather name="share-2" size={20} color="#111111" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
          >
            <Feather name="heart" size={20} color="#EF4444" />{' '}
            {/* Or #111111 for unliked */}
          </TouchableOpacity>
        </View>

        {/* Right Action: Back */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
      </View>
      {/* --- 2. Main Scrollable Content --- */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }} // Space for the bottom bar
        showsVerticalScrollIndicator={false}
        bounces={false} // Prevents pulling the image down from the top on iOS
      >
        {/* --- Media Header Section --- */}
        {mockProperty.images.length > 0 ? (
          <View style={{ height: HEADER_HEIGHT, width: '100%' }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {mockProperty.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={{ width: SCREEN_WIDTH, height: HEADER_HEIGHT }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View className="absolute bottom-6 w-full flex-row items-center justify-center space-x-1.5 space-x-reverse">
              {mockProperty.images.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${activeIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
                />
              ))}
            </View>
          </View>
        ) : (
          // --- Fallback State (Exchange / No Images) ---
          <View
            className="items-center justify-center bg-[#15304D]"
            style={{
              height: HEADER_HEIGHT,
              width: '100%',
              paddingTop: insets.top,
            }}
          >
            {/* Simulating the BUYOOTN Logo block from Figma */}
            <View className="items-center">
              <FontAwesome5
                name="home"
                size={60}
                color="white"
                className="mb-2"
              />
              <Text className="mt-2 font-cairo-bold text-3xl tracking-widest text-white">
                BUYOOTN
              </Text>
            </View>
          </View>
        )}

        {/* --- Card 3 Placeholder: Property Specs --- */}
        <View className="px-5 py-6">
          <Text className="mt-10 text-center font-cairo-semibold text-gray-400">
            (مساحة تفاصيل العقار - السعر، المساحة، الخ)
          </Text>
        </View>
      </ScrollView>

      {/* --- 3. Fixed Bottom Action Bar --- */}
      <View
        className="absolute bottom-0 w-full flex-row items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 pt-3 shadow-lg"
        style={{
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20, // Adapts to iPhone Home Bar
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        }}
      >
        {/* WhatsApp Button (Green Outline) */}
        <TouchableOpacity
          className="h-10 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#60D669]"
          activeOpacity={0.7}
        >
          <WhatsappIcon size={20} />
        </TouchableOpacity>

        {/* Phone Button (Gray Outline) */}
        <TouchableOpacity
          className="h-10 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#15304D]"
          activeOpacity={0.7}
        >
          <CallIcon color="#15304D" size={16} />
        </TouchableOpacity>

        {/* Message/Chat Button (Gold Outline) */}
        <TouchableOpacity
          className="h-10 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#B28648]"
          activeOpacity={0.7}
        >
          <ChatIcon color="#B28648" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
