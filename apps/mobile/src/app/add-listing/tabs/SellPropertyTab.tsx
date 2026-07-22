import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useListingStore } from '@/core/store/useListingStore';

// Mock Data for Features
const MOCK_FEATURES = [
  { id: '1', label: 'بطن وظهر' },
  { id: '2', label: 'زاوية' },
  { id: '3', label: 'شارع واحد' },
  { id: '4', label: 'ثلاث شوارع' },
];

export default function SellPropertyTab() {
  const {
    showPrice,
    price,
    showIncome,
    propertyIncome,
    phoneNumber,
    adDetails,
    adLevel,
    features,
    backendFeatures,
    updateField,
  } = useListingStore();

  const featuresList = backendFeatures?.sell || MOCK_FEATURES;

  return (
    <View className="pb-8">
      {/* --- 1. Features Chips (Multi-Select) --- */}
      <View className="mb-6 w-full">
        <Text
          className="mb-3 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          المزايا
        </Text>
        <View className="flex-row flex-wrap justify-start gap-2">
          {featuresList.map((feature) => {
            const isSelected = features?.includes(feature.label);
            return (
              <TouchableOpacity
                key={feature.id}
                onPress={() => {
                  const currentFeatures = features || [];
                  if (isSelected) {
                    updateField(
                      'features',
                      currentFeatures.filter((f) => f !== feature.label),
                    );
                  } else {
                    updateField('features', [
                      ...currentFeatures,
                      feature.label,
                    ]);
                  }
                }}
                activeOpacity={0.7}
                className={`mb-2 rounded-full border px-5 py-1.5 ${
                  isSelected
                    ? 'border-[#15304D] bg-[#F4F8FB]'
                    : 'border-transparent bg-[#F5F7F9]'
                }`}
              >
                <Text
                  className={`font-cairo text-[13px] ${
                    isSelected
                      ? 'font-cairo-semibold text-[#15304D]'
                      : 'text-[#6B6A6A]'
                  }`}
                >
                  {feature.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* --- 2. Price & Details Section Title --- */}
      <Text
        className="mb-6 pb-2 font-cairo-semibold text-lg text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        السعر والتفاصيل
      </Text>

      {/* --- 3. Price Toggle & Input --- */}
      <View className="mb-6 w-full">
        <View className="mb-2 flex-row items-center justify-between">
          <Text
            className="font-cairo-medium text-sm text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            السعر {showPrice && <Text className="text-red-500">*</Text>}
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
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
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

      {/* --- 4. Income Toggle & Input  --- */}
      <View className="mb-6 w-full">
        <View className="mb-2 flex-row items-center justify-between">
          <Text
            className="font-cairo-medium text-sm text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            مدخول العقار
          </Text>
          <Switch
            value={showIncome}
            onValueChange={(val) => updateField('showIncome', val)}
            trackColor={{ false: '#E2E8F0', true: '#15304D' }}
            thumbColor={'#FFFFFF'}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>

        {showIncome && (
          <View
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
            style={{ width: '100%' }}
          >
            <TextInput
              className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
              style={{ flex: 1, textAlign: 'right' }}
              placeholder="بالدينار الكويتي"
              placeholderTextColor="#979797"
              keyboardType="numeric"
              value={propertyIncome}
              onChangeText={(text) => updateField('propertyIncome', text)}
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
            className="h-[40px] flex-1 flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
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
            className="h-[40px] flex-row items-center justify-center rounded-md border border-[#ECECEC] bg-white px-3"
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

      {/* --- 6. Ad Details --- */}
      <View className="mb-8 w-full">
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          تفاصيل الاعلان <Text className="text-red-500">*</Text>
        </Text>
        <View
          className="h-32 w-full rounded-md border border-[#ECECEC] bg-white px-4 py-3"
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

      {/* --- 7. Ad Level Selection (Premium vs Normal) --- */}
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
                : 'border-[#ECECEC] bg-white'
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
                : 'border-[#ECECEC] bg-white'
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
    </View>
  );
}
