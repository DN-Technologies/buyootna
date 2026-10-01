import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SavedLocationLabel } from '@/shared/api/savedLocations.service';

import { AddressDetailsForm } from './AddressDetailsForm';
import { formatDetails } from './addressParsing';
import { SavePlacePanel } from './SavePlacePanel';
import type { AddressDetails } from './types';

interface LocationConfirmCardProps {
  addressLabel: string;
  centerCoords: [number, number]; // [lng, lat]
  isLoadingAddress: boolean;
  onConfirm: () => void;
  // Address details (القطعة / الشارع / …) and the editable address line
  details: AddressDetails;
  onChangeDetail: (key: keyof AddressDetails, value: string) => void;
  onChangeAddressLine: (text: string) => void;
  // Saving the spot as المنزل / العمل / custom (signed-in users only)
  canSave: boolean;
  onSavePlace: (label: SavedLocationLabel, name?: string) => Promise<void>;
}

export function LocationConfirmCard({
  addressLabel,
  centerCoords,
  isLoadingAddress,
  onConfirm,
  details,
  onChangeDetail,
  onChangeAddressLine,
  canSave,
  onSavePlace,
}: LocationConfirmCardProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [showDetails, setShowDetails] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const summary = formatDetails(details);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'position' : undefined}
      className="absolute left-5 right-5"
      style={{ bottom: Math.max(insets.bottom, 12) + 8 }}
    >
      <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl">
        {/* Room for the map: the expanded card scrolls instead of growing */}
        <ScrollView
          style={{ maxHeight: height * 0.5 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card Header */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text
              className="font-cairo-bold text-base text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              الموقع المحدد
            </Text>
            <View className="flex-row items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5">
              <Feather name="check-circle" size={12} color="#15304D" />
              <Text className="font-cairo-medium text-xs text-[#15304D]">
                Mapbox GPS
              </Text>
            </View>
          </View>

          {/* Address Display Box */}
          <View className="mb-3 min-h-[54px] flex-row items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
            <Feather name="map-pin" size={18} color="#15304D" className="mr-2" />
            {isLoadingAddress ? (
              <View className="flex-1 flex-row items-center">
                <Text className="mr-2 font-cairo text-xs text-gray-500">
                  جاري جلب تفاصيل الموقع...
                </Text>
                <ActivityIndicator size="small" color="#15304D" />
              </View>
            ) : (
              <View className="flex-1">
                <Text
                  testID="picker-address"
                  className="font-cairo-semibold text-sm text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                  numberOfLines={2}
                >
                  {addressLabel}
                </Text>
                {!!summary && (
                  <Text
                    testID="picker-details-summary"
                    className="mt-0.5 font-cairo text-xs text-[#15304D]"
                    style={{ writingDirection: 'rtl' }}
                    numberOfLines={2}
                  >
                    {summary}
                  </Text>
                )}
                <Text className="mt-0.5 text-right font-cairo text-[10px] text-gray-400">
                  {centerCoords[1].toFixed(5)}°N, {centerCoords[0].toFixed(5)}°E
                </Text>
              </View>
            )}
          </View>

          {/* Address details toggle + save action */}
          <View className="mb-3 flex-row items-center justify-between">
            <TouchableOpacity
              testID="toggle-address-details"
              activeOpacity={0.7}
              onPress={() => setShowDetails((v) => !v)}
              className="flex-row items-center gap-1"
            >
              <Feather
                name={showDetails ? 'chevron-up' : 'plus'}
                size={14}
                color="#15304D"
              />
              <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
                {showDetails ? 'إخفاء تفاصيل العنوان' : 'إضافة تفاصيل العنوان'}
              </Text>
            </TouchableOpacity>
            {canSave && !showSave && (
              <TouchableOpacity
                testID="open-save-place"
                activeOpacity={0.7}
                onPress={() => setShowSave(true)}
                className="flex-row items-center gap-1"
              >
                <Feather name="bookmark" size={14} color="#15304D" />
                <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
                  حفظ الموقع
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showDetails && (
            <AddressDetailsForm
              addressLine={addressLabel}
              onChangeAddressLine={onChangeAddressLine}
              details={details}
              onChangeField={onChangeDetail}
            />
          )}

          {showSave && (
            <SavePlacePanel
              onCancel={() => setShowSave(false)}
              onSave={async (label, name) => {
                await onSavePlace(label, name);
                setShowSave(false);
              }}
            />
          )}
        </ScrollView>

        {/* Confirm Location Button */}
        <TouchableOpacity
          testID="confirm-location"
          activeOpacity={0.8}
          onPress={onConfirm}
          disabled={isLoadingAddress}
          className={`w-full items-center justify-center rounded-2xl py-4 shadow-lg ${
            isLoadingAddress ? 'bg-[#15304D]/60' : 'bg-[#15304D]'
          }`}
        >
          <Text className="font-cairo-bold text-base text-white">
            تأكيد الموقع
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
