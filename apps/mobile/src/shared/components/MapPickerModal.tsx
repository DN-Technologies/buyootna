import { Camera, MapView, StyleURL } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Modal, StyleSheet, View } from 'react-native';

import { showAlert } from '@/shared/utils/alert';

import { LocationConfirmCard } from './map-picker/LocationConfirmCard';
import { MapCenterPin } from './map-picker/MapCenterPin';
import { MapControls } from './map-picker/MapControls';
import { MapSearchHeader } from './map-picker/MapSearchHeader';
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MapPickerModalProps,
  SearchResultItem,
} from './map-picker/types';
import { useLocationSearch } from './map-picker/useLocationSearch';
import { useMapGeocoding } from './map-picker/useMapGeocoding';

export type { MapPickerModalProps } from './map-picker/types';

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

  // Map Controls state
  const [mapStyle, setMapStyle] = useState<string>(StyleURL.Street);
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Custom Hooks for Geocoding & Search
  const {
    addressLabel,
    setAddressLabel,
    isLoadingAddress,
    reverseGeocode,
    triggerDebouncedReverseGeocode,
  } = useMapGeocoding(initialAddressLabel);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    setShowSearchResults,
    handleSearchChange,
    clearSearch,
  } = useLocationSearch();

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
  }, [
    visible,
    initialLat,
    initialLng,
    initialAddressLabel,
    reverseGeocode,
    setAddressLabel,
  ]);

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
        showAlert(
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
      showAlert('خطأ', 'تعذر الحصول على موقعك الحالي، يرجى المحاولة لاحقاً');
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
        {/* 1. Mapbox Map View */}
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

        {/* 2. Stationary Center Pin */}
        <MapCenterPin isLoadingAddress={isLoadingAddress} />

        {/* 3. Top Floating Search Header */}
        <MapSearchHeader
          onClose={onClose}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={clearSearch}
          isSearching={isSearching}
          showSearchResults={showSearchResults}
          setShowSearchResults={setShowSearchResults}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult}
        />

        {/* 4. Floating Control Action Buttons (Right Edge) */}
        <MapControls
          onUseGps={handleUseGps}
          isLocatingGps={isLocatingGps}
          mapStyle={mapStyle}
          onToggleMapStyle={toggleMapStyle}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />

        {/* 5. Bottom Address Card & Confirmation Button */}
        <LocationConfirmCard
          addressLabel={addressLabel}
          centerCoords={centerCoords}
          isLoadingAddress={isLoadingAddress}
          onConfirm={handleConfirm}
        />
      </View>
    </Modal>
  );
}
