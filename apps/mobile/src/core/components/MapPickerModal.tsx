import { Feather } from '@expo/vector-icons';
import Mapbox, { Camera, MapView, StyleURL } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Initialize Mapbox with access token
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoiY29uc3R5b3Vzc2VmIiwiYSI6ImNtcmh2dTZ3azFrNzczMHNldzNyc2hia3gifQ.VteDtFkHHKEsyVL004WSkQ';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (addressName: string, lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddressLabel?: string;
}

interface SearchResultItem {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
}

// Kuwait Center Default Coordinates: [Longitude, Latitude]
const DEFAULT_CENTER: [number, number] = [47.9774, 29.3759];
const DEFAULT_ZOOM = 14.5;

export default function MapPickerModal({
  visible,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
  initialAddressLabel,
}: MapPickerModalProps) {
  const cameraRef = useRef<Camera>(null);
  const mapRef = useRef<MapView>(null);

  // Center Coordinates [lng, lat]
  const [centerCoords, setCenterCoords] = useState<[number, number]>(() => {
    if (initialLat && initialLng) {
      return [initialLng, initialLat];
    }
    return DEFAULT_CENTER;
  });

  const [addressLabel, setAddressLabel] = useState<string>(
    initialAddressLabel || 'جاري تحميل الموقع...',
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Map Controls state
  const [mapStyle, setMapStyle] = useState<string>(StyleURL.Street);
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);

  const searchTimerRef = useRef<any>(null);
  const reverseGeoTimerRef = useRef<any>(null);

  // Re-center map when modal opens or initial props change
  useEffect(() => {
    if (visible) {
      const targetCoords: [number, number] =
        initialLat && initialLng ? [initialLng, initialLat] : DEFAULT_CENTER;
      setCenterCoords(targetCoords);
      if (initialAddressLabel) {
        setAddressLabel(initialAddressLabel);
      } else {
        reverseGeocode(targetCoords[1], targetCoords[0]);
      }

      // Animate Camera to target after delay to ensure map view is mounted
      setTimeout(() => {
        cameraRef.current?.setCamera({
          centerCoordinate: targetCoords,
          zoomLevel: DEFAULT_ZOOM,
          animationDuration: 800,
        });
      }, 300);
    }
  }, [visible, initialLat, initialLng, initialAddressLabel]);

  // Reverse Geocoding via Mapbox Places API (Fallback to Nominatim)
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      // 1. Try Mapbox Reverse Geocoding API
      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&language=ar`;
      const response = await fetch(mapboxUrl);
      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];
        // Clean up address label
        const fullPlace = feature.place_name || feature.text || '';
        const parts = fullPlace.split(',').map((s: string) => s.trim());
        const cleanedLabel =
          parts.length > 2 ? `${parts[0]}، ${parts[1]}` : parts.join('، ');

        setAddressLabel(cleanedLabel);
      } else {
        // 2. Fallback to OpenStreetMap Nominatim
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`;
        const nomRes = await fetch(nomUrl, {
          headers: { 'User-Agent': 'BuyootnaApp/1.0' },
        });
        const nomData = await nomRes.json();
        if (nomData && nomData.address) {
          const addr = nomData.address;
          const neighborhood = addr.neighbourhood || addr.suburb || '';
          const cityOrTown = addr.city || addr.town || addr.village || '';
          const state = addr.state || addr.county || '';
          const parts = [neighborhood, cityOrTown, state]
            .filter(Boolean)
            .filter((val, index, self) => self.indexOf(val) === index);
          setAddressLabel(
            parts.length > 0
              ? parts.join('، ')
              : nomData.display_name.split(',')[0],
          );
        } else {
          setAddressLabel(`موقع محدد (${lat.toFixed(4)}، ${lng.toFixed(4)})`);
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setAddressLabel(`موقع محدد (${lat.toFixed(4)}، ${lng.toFixed(4)})`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Debounced reverse geocode when camera moves
  const triggerDebouncedReverseGeocode = (lat: number, lng: number) => {
    if (reverseGeoTimerRef.current) {
      clearTimeout(reverseGeoTimerRef.current);
    }
    reverseGeoTimerRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 600);
  };

  // Forward Place Search via Mapbox Geocoding API
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!text.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    searchTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            text,
          )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=kw&language=ar&proximity=47.9774,29.3759`;

          const res = await fetch(url);
          const data = await res.json();

          if (data && data.features) {
            const results: SearchResultItem[] = data.features.map(
              (item: any) => ({
                id: item.id,
                place_name: item.place_name_ar || item.place_name,
                text: item.text_ar || item.text,
                center: item.center, // [lng, lat]
              }),
            );
            setSearchResults(results);
          } else {
            setSearchResults([]);
          }
        } catch (err) {
          console.warn('Search geocoding error:', err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 400);
  };

  // Select place from search list
  const handleSelectSearchResult = (item: SearchResultItem) => {
    const [lng, lat] = item.center;
    setCenterCoords([lng, lat]);
    setAddressLabel(item.text || item.place_name);
    setShowSearchResults(false);
    setSearchQuery(item.text || item.place_name);
    Keyboard.dismiss();

    cameraRef.current?.setCamera({
      centerCoordinate: [lng, lat],
      zoomLevel: 15.5,
      animationDuration: 1000,
    });

    reverseGeocode(lat, lng);
  };

  // GPS Device Location Handler
  const handleUseGps = async () => {
    try {
      setIsLocatingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'الإذن مطلوب',
          'يرجى تفعيل صلاحية الوصول للموقع الجغرافي لاستخدام هذه الميزة.',
          [{ text: 'حسناً' }],
        );
        setIsLocatingGps(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const newCoords: [number, number] = [longitude, latitude];

      setCenterCoords(newCoords);

      cameraRef.current?.setCamera({
        centerCoordinate: newCoords,
        zoomLevel: 16,
        animationDuration: 1000,
      });

      reverseGeocode(latitude, longitude);
    } catch (err) {
      console.warn('GPS location error:', err);
      Alert.alert('خطأ', 'تعذر الحصول على موقعك الحالي، يرجى المحاولة لاحقاً');
    } finally {
      setIsLocatingGps(false);
    }
  };

  // Zoom Controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 1.5, 19);
    setZoomLevel(newZoom);
    cameraRef.current?.setCamera({
      zoomLevel: newZoom,
      animationDuration: 300,
    });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 1.5, 6);
    setZoomLevel(newZoom);
    cameraRef.current?.setCamera({
      zoomLevel: newZoom,
      animationDuration: 300,
    });
  };

  // Toggle Map Style (Street vs Satellite)
  const toggleMapStyle = () => {
    setMapStyle((prev) =>
      prev === StyleURL.Street ? StyleURL.Satellite : StyleURL.Street,
    );
  };

  // Camera region changed event (as map is dragged)
  const handleCameraChanged = (state: any) => {
    if (state && state.properties && state.properties.center) {
      const [lng, lat] = state.properties.center;
      setCenterCoords([lng, lat]);
      if (state.properties.zoom) {
        setZoomLevel(state.properties.zoom);
      }
      triggerDebouncedReverseGeocode(lat, lng);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    onConfirm(addressLabel, centerCoords[1], centerCoords[0]);
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
        {/* --- 1. Mapbox Map View --- */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          styleURL={mapStyle}
          scaleBarEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          onCameraChanged={handleCameraChanged}
          onTouchStart={() => {
            if (showSearchResults) {
              setShowSearchResults(false);
              Keyboard.dismiss();
            }
          }}
        >
          <Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: centerCoords,
              zoomLevel: DEFAULT_ZOOM,
            }}
          />
        </MapView>

        {/* --- 2. Stationary Center Pin (Google Maps Style) --- */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
            className="items-center justify-center"
          >
            <View className="items-center justify-center pb-9">
              {/* Floating Badge above pin */}
              <View className="mb-1 rounded-full bg-[#15304D] px-3 py-1 shadow-md">
                <Text className="font-cairo-semibold text-xs text-white">
                  اسحب الخريطة لتحديد الموقع
                </Text>
              </View>

              {/* Pin Header */}
              <View className="h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#15304D] shadow-2xl">
                {isLoadingAddress ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Feather name="map-pin" size={22} color="white" />
                )}
              </View>
              {/* Pin Arrow Tip */}
              <View
                className="h-2.5 w-2.5 rotate-45 bg-[#15304D]"
                style={{ marginTop: -5 }}
              />
              {/* Pin Base Shadow */}
              <View
                className="h-2 w-5 rounded-full bg-black/20"
                style={{ marginTop: 2 }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>

        {/* --- 3. Top Floating Search Header --- */}
        <SafeAreaView className="absolute left-4 right-4 top-2">
          <View className="flex-row items-center gap-2">
            {/* Back Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-lg"
            >
              <Feather name="arrow-right" size={22} color="#15304D" />
            </TouchableOpacity>

            {/* Search Input Bar */}
            <View className="h-12 flex-1 flex-row items-center rounded-2xl border border-gray-100 bg-white px-3 shadow-lg">
              <Feather
                name="search"
                size={18}
                color="#94A3B8"
                className="mr-2"
              />
              <TextInput
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="ابحث عن منطقة، حي، أو معلم..."
                placeholderTextColor="#94A3B8"
                className="flex-1 px-2 py-1 text-right font-cairo text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchResults(true);
                }}
              />
              {isSearching ? (
                <ActivityIndicator
                  size="small"
                  color="#15304D"
                  className="ml-1"
                />
              ) : searchQuery ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="p-1"
                >
                  <Feather name="x" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Autocomplete Results Dropdown */}
          {showSearchResults && (
            <View className="mt-2 max-h-60 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
              {searchResults.length === 0 && !isSearching ? (
                <View className="items-center p-4">
                  <Text className="font-cairo text-sm text-gray-500">
                    لم يتم العثور على نتائج طابق بحثك
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelectSearchResult(item)}
                      className="flex-row items-center justify-between border-b border-gray-100 p-3"
                    >
                      <View className="flex-1 pr-3">
                        <Text
                          className="text-right font-cairo-semibold text-sm text-[#111111]"
                          style={{ writingDirection: 'rtl' }}
                        >
                          {item.text}
                        </Text>
                        <Text
                          className="text-right font-cairo text-xs text-gray-500"
                          numberOfLines={1}
                          style={{ writingDirection: 'rtl' }}
                        >
                          {item.place_name}
                        </Text>
                      </View>
                      <Feather name="map-pin" size={16} color="#15304D" />
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          )}
        </SafeAreaView>

        {/* --- 4. Floating Control Action Buttons (Right Edge) --- */}
        <View className="absolute right-4 top-28 items-center gap-3">
          {/* GPS My Location Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleUseGps}
            disabled={isLocatingGps}
            className="h-11 w-11 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-xl"
          >
            {isLocatingGps ? (
              <ActivityIndicator size="small" color="#15304D" />
            ) : (
              <Feather name="navigation" size={20} color="#15304D" />
            )}
          </TouchableOpacity>

          {/* Map Style Switcher (Street / Satellite) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleMapStyle}
            className="h-11 w-11 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-xl"
          >
            <Feather
              name={mapStyle === StyleURL.Street ? 'layers' : 'map'}
              size={20}
              color="#15304D"
            />
          </TouchableOpacity>

          {/* Zoom In */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleZoomIn}
            className="h-10 w-10 items-center justify-center rounded-t-xl border border-b-0 border-gray-100 bg-white shadow-xl"
          >
            <Feather name="plus" size={20} color="#15304D" />
          </TouchableOpacity>

          {/* Zoom Out */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleZoomOut}
            className="h-10 w-10 items-center justify-center rounded-b-xl border border-gray-100 bg-white shadow-xl"
            style={{ marginTop: -12 }}
          >
            <Feather name="minus" size={20} color="#15304D" />
          </TouchableOpacity>
        </View>

        {/* --- 5. Bottom Address Card & Confirmation Button --- */}
        <SafeAreaView className="absolute bottom-6 left-5 right-5">
          <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl">
            {/* Card Header */}
            <View className="mb-3 flex-row items-center justify-between">
              <Text
                className="font-cairo-bold text-base text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                موقع العقار المحدد
              </Text>
              <View className="flex-row items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5">
                <Feather name="check-circle" size={12} color="#15304D" />
                <Text className="font-cairo-medium text-xs text-[#15304D]">
                  Mapbox GPS
                </Text>
              </View>
            </View>

            {/* Address Display Box */}
            <View className="mb-4 min-h-[54px] flex-row items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
              <Feather
                name="map-pin"
                size={18}
                color="#15304D"
                className="mr-2"
              />
              {isLoadingAddress ? (
                <View className="flex-1 flex-row items-center justify-end">
                  <Text className="mr-2 font-cairo text-xs text-gray-500">
                    جاري جلب تفاصيل الموقع...
                  </Text>
                  <ActivityIndicator size="small" color="#15304D" />
                </View>
              ) : (
                <View className="flex-1">
                  <Text
                    className="text-right font-cairo-semibold text-sm text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                    numberOfLines={2}
                  >
                    {addressLabel}
                  </Text>
                  <Text className="mt-0.5 text-right font-cairo text-[10px] text-gray-400">
                    {centerCoords[1].toFixed(5)}°N, {centerCoords[0].toFixed(5)}
                    °E
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Location Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirm}
              disabled={isLoadingAddress}
              className={`w-full items-center justify-center rounded-2xl py-4 shadow-lg ${
                isLoadingAddress ? 'bg-[#15304D]/60' : 'bg-[#15304D]'
              }`}
            >
              <Text className="font-cairo-bold text-base text-white">
                تأكيد موقع العقار
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
