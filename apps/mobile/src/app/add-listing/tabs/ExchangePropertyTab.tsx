import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import SelectionDrawer from '@/core/components/filters/SelectionDrawer';
import { useListingStore } from '@/core/store/useListingStore';

// Mock Data for Features
const MOCK_FEATURES = [
  { id: '1', label: 'بطن وظهر' },
  { id: '2', label: 'زاوية' },
  { id: '3', label: 'شارع واحد' },
  { id: '4', label: 'ارتداد كبير' },
];

export default function ExchangePropertyTab() {
  const {
    requestYear,
    requiredYear,
    showPrice,
    price,
    phoneNumber,
    allocationState,
    adDetails,
    adLevel,
    features,
    updateField,
  } = useListingStore();

  const featuresDrawerRef = useRef<BottomSheetModal>(null);

  return (
    <View className="pb-8">
      {/* --- 1. Years Row (Unique to Exchange) --- */}
      <View className="mb-6 w-full flex-row gap-3" style={{ gap: 12 }}>
        {/* Request Year */}
        <View className="flex-1" style={{ flex: 1 }}>
          <Text
            className="mb-1 font-cairo-medium text-sm text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            سنة الطلب <Text className="text-red-500">*</Text>
          </Text>
          <View
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
            style={{ width: '100%' }}
          >
            <TextInput
              className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
              style={{ flex: 1, textAlign: 'right' }}
              placeholder="2019"
              placeholderTextColor="#979797"
              keyboardType="numeric"
              maxLength={4}
              value={requestYear}
              onChangeText={(text) => updateField('requestYear', text)}
            />
          </View>
        </View>

        {/* Required Year */}
        <View className="flex-1" style={{ flex: 1 }}>
          <Text
            className="mb-1 font-cairo-medium text-sm text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            السنة المطلوبة <Text className="text-red-500">*</Text>
          </Text>
          <View
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
            style={{ width: '100%' }}
          >
            <TextInput
              className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
              style={{ flex: 1, textAlign: 'right' }}
              placeholder="2025"
              placeholderTextColor="#979797"
              keyboardType="numeric"
              maxLength={4}
              value={requiredYear}
              onChangeText={(text) => updateField('requiredYear', text)}
            />
          </View>
        </View>
      </View>

      {/* --- 2. Features Dropdown --- */}
      <View className="mb-8">
        <DrawerTrigger
          label="المزايا"
          placeholder="ما يميز عقارك"
          value={features?.join('، ')}
          onPress={() => featuresDrawerRef.current?.present()}
        />
      </View>

      {/* --- 3. Price & Details Section Title --- */}
      <Text
        className="mb-6 pb-2 font-cairo-semibold text-lg text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        السعر والتفاصيل
      </Text>

      {/* --- 4. Price Toggle & Input --- */}
      <View className="mb-6 w-full">
        <View className="mb-2 flex-row items-center justify-between">
          <Text
            className="font-cairo-medium text-sm text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            السعر
          </Text>
          <Switch
            value={showPrice}
            onValueChange={(val) => updateField('showPrice', val)}
            trackColor={{ false: '#E2E8F0', true: '#15304D' }}
            thumbColor={'#FFFFFF'}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>

        {showPrice && (
          <View
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
            style={{ width: '100%' }}
          >
            <TextInput
              className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
              style={{ flex: 1, textAlign: 'right' }}
              placeholder="بالدينار الكويتي"
              placeholderTextColor="#979797"
              keyboardType="numeric"
              value={price}
              onChangeText={(text) => updateField('price', text)}
            />
          </View>
        )}
      </View>

      {/* --- 5. Phone Number --- */}
      <View className="mb-6 w-full">
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          رقم الهاتف <Text className="text-red-500">*</Text>
        </Text>
        <View
          className="h-[40px] flex-row items-center gap-2"
          style={{ gap: 8 }}
        >
          {/* Phone Input */}
          <View
            className="h-[40px] flex-1 flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
            style={{ height: 40, flex: 1 }}
          >
            <TextInput
              className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
              style={{ flex: 1, textAlign: 'right' }}
              placeholder="58094586"
              placeholderTextColor="#979797"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) => updateField('phoneNumber', text)}
            />
          </View>

          {/* Static Country Code */}
          <View
            className="h-[40px] flex-row items-center justify-center rounded-md border border-gray-200 bg-white px-3"
            style={{ height: 40 }}
          >
            <Text className="font-cairo-semibold text-[#111111]">+965</Text>
            <Feather
              name="chevron-down"
              size={16}
              color="#64748B"
              className="ml-1"
            />
          </View>
        </View>
      </View>

      {/* --- 6. Allocation State (حالة التخصيص) - UNIQUE TO EXCHANGE --- */}
      <View className="mb-6 w-full">
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          حالة التخصيص
        </Text>
        <View
          className="h-24 w-full rounded-md border border-gray-200 bg-white px-4 py-3"
          style={{ width: '100%' }}
        >
          <TextInput
            className="flex-1 text-right font-cairo-medium leading-6 text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder="اكتب نبذة عن الاعلان..."
            placeholderTextColor="#979797"
            multiline
            textAlignVertical="top"
            value={allocationState}
            onChangeText={(text) => updateField('allocationState', text)}
          />
        </View>
      </View>

      {/* --- 7. Ad Details --- */}
      <View className="mb-8 w-full">
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          تفاصيل الاعلان <Text className="text-red-500">*</Text>
        </Text>
        <View
          className="h-32 w-full rounded-md border border-gray-200 bg-white px-4 py-3"
          style={{ width: '100%' }}
        >
          <TextInput
            className="flex-1 text-right font-cairo-medium leading-6 text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder="اكتب نبذة عن الاعلان لاقناع العملاء..."
            placeholderTextColor="#979797"
            multiline
            textAlignVertical="top"
            value={adDetails}
            onChangeText={(text) => updateField('adDetails', text)}
          />
        </View>
      </View>

      {/* --- 8. Ad Level Selection (Premium vs Normal) --- */}
      <View className="mb-6">
        <Text
          className="mb-3 font-cairo-semibold text-base text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          اختر نوع اعلانك
        </Text>
        <View className="h-20 flex-row gap-3" style={{ gap: 12 }}>
          {/* Premium Ad Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => updateField('adLevel', 'premium')}
            className={`flex-1 items-center justify-center rounded-lg border-2 ${
              adLevel === 'premium'
                ? 'border-transparent'
                : 'border-gray-200 bg-white'
            }`}
            style={{ flex: 1, overflow: 'hidden' }}
          >
            {adLevel === 'premium' && (
              <LinearGradient
                colors={['#FF8028', '#FACC15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 8,
                }}
              />
            )}
            <View className="flex-row items-center gap-3">
              <Image
                source={require('@/assets/icons/add-listing/premium-icon.svg')}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: '#000000',
                }}
              />
              <View className="items-start">
                <Text
                  className={`font-cairo-semibold text-[14px] text-[#111111]`}
                >
                  إعلان مميز
                </Text>
                <Text
                  className={`font-cairo-medium text-[12px] text-[#111111]`}
                >
                  يظهر أعلى القائمة
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Normal Ad Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => updateField('adLevel', 'normal')}
            className={`flex-1 items-center justify-center rounded-lg border-2 ${
              adLevel === 'normal'
                ? 'border-[#15304D] bg-[#F4F8FB]'
                : 'border-gray-200 bg-white'
            }`}
            style={{ flex: 1 }}
          >
            <View className="flex-row items-center gap-3">
              <Image
                source={require('@/assets/icons/add-listing/normal-icon.svg')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: adLevel === 'normal' ? '#15304D' : '#94A3B8',
                }}
              />
              <View className="items-start">
                <Text
                  className={`font-cairo-semibold text-[14px] ${adLevel === 'normal' ? 'text-[#15304D]' : 'text-[#111111]'}`}
                >
                  إعلان عادي
                </Text>
                <Text
                  className={`font-cairo-medium text-[12px] ${adLevel === 'normal' ? 'text-[#15304D]/70' : 'text-[#64748B]'}`}
                >
                  يظهر ضمن القائمة
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Modals --- */}
      <SelectionDrawer
        ref={featuresDrawerRef}
        title="ما يميز عقارك"
        data={MOCK_FEATURES}
        onSelect={(item) => updateField('features', [item.label])}
      />
    </View>
  );
}
