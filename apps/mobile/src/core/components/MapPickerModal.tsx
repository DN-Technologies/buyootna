import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (addressName: string, lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const KUWAIT_CENTER = {
  latitude: 29.3759,
  longitude: 47.9774,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapPickerModal({
  visible,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
}: MapPickerModalProps) {
  const [region, setRegion] = useState(KUWAIT_CENTER);
  const [addressLabel, setAddressLabel] = useState('جاري تحميل الموقع...');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    if (initialLat && initialLng) {
      setRegion({
        latitude: initialLat,
        longitude: initialLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      reverseGeocode(initialLat, initialLng);
    } else {
      setRegion(KUWAIT_CENTER);
      reverseGeocode(KUWAIT_CENTER.latitude, KUWAIT_CENTER.longitude);
    }
  }, [visible, initialLat, initialLng]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`,
        {
          headers: {
            'User-Agent': 'BuyootnaApp/1.0',
          },
        },
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const neighborhood = addr.neighbourhood || addr.suburb || '';
        const cityOrTown = addr.city || addr.town || addr.village || '';
        const state = addr.state || addr.county || '';

        const parts = [neighborhood, cityOrTown, state]
          .filter(Boolean)
          .filter((val, index, self) => self.indexOf(val) === index); // unique values

        const displayAddress =
          parts.length > 0 ? parts.join('، ') : data.display_name.split(',')[0];

        setAddressLabel(displayAddress);
      } else {
        setAddressLabel(`موقع محدد (${lat.toFixed(4)}، ${lng.toFixed(4)})`);
      }
    } catch (err) {
      console.error(err);
      setAddressLabel(`موقع محدد (${lat.toFixed(4)}، ${lng.toFixed(4)})`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleRegionChangeComplete = (newRegion: any) => {
    setRegion(newRegion);
    reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const handleConfirm = () => {
    onConfirm(addressLabel, region.latitude, region.longitude);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFillObject} className="bg-white">
        {/* Map View */}
        <MapView
          provider={PROVIDER_DEFAULT}
          style={StyleSheet.absoluteFillObject}
          region={region}
          onRegionChangeComplete={handleRegionChangeComplete}
        />

        {/* Center Pin Overlay (Stationary) */}
        <View
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
          className="items-center justify-center"
        >
          <View className="items-center justify-center pb-9">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#15304D] shadow-lg">
              <Feather name="map-pin" size={22} color="white" />
            </View>
            {/* Tiny Pin Arrow */}
            <View
              className="h-2 w-2 rotate-45 bg-[#15304D]"
              style={{ marginTop: -4 }}
            />
          </View>
        </View>

        {/* Header (Floating Back Button) */}
        <SafeAreaView className="absolute left-4 top-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg"
          >
            <Feather name="arrow-right" size={22} color="#15304D" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Bottom Details Card */}
        <SafeAreaView className="absolute bottom-6 left-6 right-6">
          <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl">
            <Text
              className="mb-2 font-cairo-bold text-base text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              موقع المقر الرئيسي
            </Text>

            {/* Address Display */}
            <View className="mb-5 min-h-[50px] flex-row items-center justify-end rounded-2xl bg-gray-50 p-4">
              {isLoadingAddress ? (
                <ActivityIndicator
                  size="small"
                  color="#15304D"
                  className="mr-3"
                />
              ) : (
                <Text
                  className="flex-1 font-cairo-medium text-sm text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {addressLabel}
                </Text>
              )}
              <Feather
                name="map-pin"
                size={18}
                color="#15304D"
                className="ml-3"
              />
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirm}
              disabled={isLoadingAddress}
              className={`w-full items-center justify-center rounded-2xl py-4 ${
                isLoadingAddress ? 'bg-primary/50' : 'bg-primary'
              }`}
            >
              <Text className="font-cairo-bold text-base text-white">
                تأكيد موقع المقر
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
