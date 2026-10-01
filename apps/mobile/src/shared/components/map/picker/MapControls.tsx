import { Feather } from '@expo/vector-icons';
import { StyleURL } from '@rnmapbox/maps';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MapControlsProps {
  onUseGps: () => void;
  isLocatingGps: boolean;
  mapStyle: string;
  onToggleMapStyle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function MapControls({
  onUseGps,
  isLocatingGps,
  mapStyle,
  onToggleMapStyle,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  const insets = useSafeAreaInsets();
  return (
    // Below the search bar, wherever the notch puts it
    <View
      className="absolute right-4 items-center gap-3"
      style={{ top: insets.top + 76 }}
    >
      {/* GPS My Location Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onUseGps}
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
        onPress={onToggleMapStyle}
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
        onPress={onZoomIn}
        className="h-10 w-10 items-center justify-center rounded-t-xl border border-b-0 border-gray-100 bg-white shadow-xl"
      >
        <Feather name="plus" size={20} color="#15304D" />
      </TouchableOpacity>

      {/* Zoom Out */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onZoomOut}
        className="h-10 w-10 items-center justify-center rounded-b-xl border border-gray-100 bg-white shadow-xl"
        style={{ marginTop: -12 }}
      >
        <Feather name="minus" size={20} color="#15304D" />
      </TouchableOpacity>
    </View>
  );
}
