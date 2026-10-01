import { Camera, MapView, StyleURL } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Modal, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import { cleanDetails } from './picker/addressParsing';
import { LocationConfirmCard } from './picker/LocationConfirmCard';
import { MapCenterPin } from './picker/MapCenterPin';
import { MapControls } from './picker/MapControls';
import { MapSearchHeader } from './picker/MapSearchHeader';
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MapPickerModalProps,
  type PickedPlace,
  SearchResultItem,
} from './picker/types';
import { useAddressDraft } from './picker/useAddressDraft';
import { type AreaMatch, locateArea, useAreaSearch } from './picker/useAreaSearch';
import { useLocationSearch } from './picker/useLocationSearch';
import { useMapGeocoding } from './picker/useMapGeocoding';
import { useRecentPlaces } from './picker/useRecentPlaces';
import { useSavedPlaces } from './picker/useSavedPlaces';

export type { MapPickerModalProps } from './picker/types';

export default function MapPickerModal({
  visible,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
  initialAddressLabel,
  initialDetails,
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
  // Set while flying to a saved/recent place (cleared on the next drag)
  const skipNextGeocode = useRef(false);

  // Custom Hooks for Geocoding & Search
  const {
    addressLabel,
    setAddressLabel,
    isLoadingAddress,
    detailsGuess,
    reverseGeocode,
    triggerDebouncedReverseGeocode,
  } = useMapGeocoding(initialAddressLabel);

  // القطعة / الشارع / … and an address line the user may correct
  const draft = useAddressDraft();
  const { applyGuess } = draft;
  useEffect(() => {
    applyGuess(detailsGuess);
  }, [detailsGuess, applyGuess]);

  const { recent, remember } = useRecentPlaces();
  const savedPlaces = useSavedPlaces();

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
  const areaMatches = useAreaSearch(searchQuery);

  // Re-center map when modal opens or initial props change
  useEffect(() => {
    if (visible) {
      const targetCoords: [number, number] =
        initialLat && initialLng ? [initialLng, initialLat] : DEFAULT_CENTER;
      setCenterCoords(targetCoords);
      draft.load(initialDetails);
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
    // Runs per opening: draft.load is stable, and initialDetails is read
    // once then -- re-running on every keystroke would wipe the user's edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visible,
    initialLat,
    initialLng,
    initialAddressLabel,
    reverseGeocode,
    setAddressLabel,
    // draft.load is stable; initialDetails is read once per opening
     
  ]);

  const flyTo = (lng: number, lat: number, zoom: number) => {
    setCenterCoords([lng, lat]);
    cameraRef.current?.setCamera({
      centerCoordinate: [lng, lat],
      zoomLevel: zoom,
      animationDuration: 800,
    });
  };

  // A saved or recent place: its address and details come with it
  const handleSelectPlace = (place: PickedPlace) => {
    setShowSearchResults(false);
    Keyboard.dismiss();
    draft.load(place.details);
    setAddressLabel(place.address);
    skipNextGeocode.current = true;
    flyTo(place.lng, place.lat, 16.5);
  };

  // One of our Kuwait areas: centre on it, carry "قطعة N" into the details
  const handleSelectArea = async (match: AreaMatch) => {
    setShowSearchResults(false);
    Keyboard.dismiss();
    setSearchQuery(match.block ? `${match.area} قطعة ${match.block}` : match.area);
    const centre = await locateArea(match);
    if (!centre) {
      Alert.alert('تعذر تحديد المنطقة', 'جرّب البحث باسم مكان قريب أو حرّك الخريطة.');
      return;
    }
    draft.clearForNewSpot();
    if (match.block) draft.setField('block', match.block);
    flyTo(centre[0], centre[1], match.block ? 14.5 : 13);
    reverseGeocode(centre[1], centre[0]);
  };

  // Tap anywhere: the pin goes there (the map moves under the fixed pin)
  const handleMapPress = (feature: any) => {
    const coords = feature?.geometry?.coordinates as
      | [number, number]
      | undefined;
    if (!coords) return;
    if (showSearchResults) {
      setShowSearchResults(false);
      Keyboard.dismiss();
      return;
    }
    draft.clearForNewSpot();
    flyTo(coords[0], coords[1], Math.max(zoomLevel, 15));
    reverseGeocode(coords[1], coords[0]);
  };

  // Save the current spot as المنزل / العمل / custom
  const handleSavePlace = async (
    label: 'HOME' | 'WORK' | 'OTHER',
    name?: string,
  ) => {
    try {
      await savedPlaces.save({
        label,
        name,
        address: draft.customAddress ?? addressLabel,
        latitude: centerCoords[1],
        longitude: centerCoords[0],
        details: cleanDetails(draft.details),
      });
      Alert.alert('تم الحفظ', 'ستجد الموقع ضمن المحفوظة عند البحث.');
    } catch (e) {
      Alert.alert('خطأ', getApiErrorMessage(e, 'تعذر حفظ الموقع'));
      throw e;
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      await savedPlaces.remove(id);
    } catch (e) {
      Alert.alert('خطأ', getApiErrorMessage(e, 'تعذر حذف الموقع'));
    }
  };

  // Select place from search list
  const handleSelectSearchResult = (item: SearchResultItem) => {
    const [lng, lat] = item.center;
    setCenterCoords([lng, lat]);
    setAddressLabel(item.text || item.place_name);
    setShowSearchResults(false);
    setSearchQuery(item.text || item.place_name);
    Keyboard.dismiss();
    draft.clearForNewSpot();

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
      draft.clearForNewSpot();

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
      // A saved/recent place already has its address; don't replace it
      // with the map's guess while the camera settles there
      if (skipNextGeocode.current) return;
      triggerDebouncedReverseGeocode(lat, lng);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    const address = (draft.customAddress ?? addressLabel).trim() || addressLabel;
    const details = cleanDetails(draft.details);
    remember({
      address,
      lat: centerCoords[1],
      lng: centerCoords[0],
      details,
    });
    onConfirm(address, centerCoords[1], centerCoords[0], details);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {/* A Modal renders outside the app's SafeAreaProvider, where insets
          read 0 -- the search bar then sat under the notch */}
      <SafeAreaProvider>
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
          onPress={handleMapPress}
          onTouchStart={() => {
            skipNextGeocode.current = false;
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
          areaMatches={areaMatches}
          onSelectArea={handleSelectArea}
          savedPlaces={savedPlaces.saved}
          recentPlaces={recent}
          onSelectPlace={handleSelectPlace}
          onDeleteSaved={handleDeleteSaved}
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
          addressLabel={draft.customAddress ?? addressLabel}
          centerCoords={centerCoords}
          isLoadingAddress={isLoadingAddress}
          onConfirm={handleConfirm}
          details={draft.details}
          onChangeDetail={draft.setField}
          onChangeAddressLine={draft.setCustomAddress}
          canSave={savedPlaces.canSave}
          onSavePlace={handleSavePlace}
        />
      </View>
      </SafeAreaProvider>
    </Modal>
  );
}
