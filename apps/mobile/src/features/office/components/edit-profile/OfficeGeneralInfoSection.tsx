import { Feather } from '@expo/vector-icons';
import { Text, TextInput, View } from 'react-native';

import { CalendarClockIcon, LocationPinIcon } from '@/assets/icons/more';
import IdentityContactPhone from '@/shared/components/profile/IdentityContactPhone';

interface OfficeGeneralInfoSectionProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  hqLocation: string;
  setHqLocation: (val: string) => void;
  about: string;
  setAbout: (val: string) => void;
  services: string;
  setServices: (val: string) => void;
}

export default function OfficeGeneralInfoSection({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  hqLocation,
  setHqLocation,
  about,
  setAbout,
  services,
  setServices,
}: OfficeGeneralInfoSectionProps) {
  return (
    <View>
      <Text
        className="mb-3 font-cairo-semibold text-[17px] text-black"
        style={{ writingDirection: 'rtl' }}
      >
        عن المكتب
      </Text>

      <View className="gap-4">
        {/* Field: الاسم */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            الاسم
          </Text>
          <View className="h-[46px] rounded-[8px] border border-[#ECECEC] bg-white px-3 justify-center">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="المنار"
              placeholderTextColor="#979797"
              textAlign="right"
              className="font-cairo-regular text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            />
          </View>
        </View>

        {/* Field: البريد الالكتروني */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            البريد الالكتروني
          </Text>
          <View className="h-[46px] rounded-[8px] border border-[#ECECEC] bg-white px-3 justify-center">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="salemelshekh@gmail.com"
              placeholderTextColor="#979797"
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
              className="font-cairo-regular text-[14px] text-[#111111]"
              style={{ writingDirection: 'ltr' }}
            />
          </View>
        </View>

        {/* Field: رقم الهاتف (RTL-First: Phone on Right, +965 on Left) */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            رقم الهاتف
          </Text>
          <View className="flex-row items-center gap-2">
            {/* Visual Right (Child 0): Phone Number Input */}
            <View className="h-[46px] flex-1 rounded-[8px] border border-[#ECECEC] bg-white px-3 justify-center">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="58094586"
                placeholderTextColor="#979797"
                keyboardType="phone-pad"
                textAlign="right"
                className="font-cairo-regular text-[14px] text-[#111111]"
                style={{ writingDirection: 'ltr' }}
              />
            </View>

            {/* Visual Left (Child 1): +965 Country Selector Pill */}
            <View className="h-[46px] flex-row items-center justify-center gap-1.5 rounded-[8px] border border-[#ECECEC] bg-white px-3">
              <Text className="font-cairo-regular text-[14px] text-[#979797]">
                +965
              </Text>
              <Feather name="chevron-down" size={14} color="#979797" />
            </View>
          </View>
        </View>

        {/* رقم التواصل: the account's phone or the office's own line.
            No WhatsApp: offices are reached by phone or in-app chat */}
        <IdentityContactPhone />

        {/* Field: المقر الرئيسي */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            المقر الرئيسي
          </Text>
          <View className="h-[46px] flex-row items-center justify-between rounded-[8px] border border-[#ECECEC] bg-white px-3">
            {/* Visual Right (Child 0): Input Text */}
            <TextInput
              value={hqLocation}
              onChangeText={setHqLocation}
              placeholder="السالمية"
              placeholderTextColor="#979797"
              textAlign="right"
              className="flex-1 font-cairo-regular text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            />
            {/* Visual Left (Child 1): Location Pin Icon */}
            <LocationPinIcon size={16} color="#15304D" />
          </View>
        </View>

        {/* Field: نبذة عن الشركة / المكتب (Multiline Textarea) */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            نبذة عن الشركة
          </Text>
          <View className="min-h-[110px] rounded-[8px] border border-[#ECECEC] bg-white p-3">
            <TextInput
              value={about}
              onChangeText={setAbout}
              multiline
              numberOfLines={4}
              placeholder="مكتب متخصص في بيع وتأجير العقارات السكنية والتجارية مع خدمات استشارية متكاملة."
              placeholderTextColor="#979797"
              textAlign="right"
              className="font-cairo-regular text-[14px] leading-[22px] text-[#111111]"
              style={{
                writingDirection: 'rtl',
                textAlign: 'right',
                minHeight: 85,
              }}
            />
          </View>
        </View>

        {/* Field: مواعيد العمل */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            مواعيد العمل
          </Text>
          <View className="h-[46px] flex-row items-center justify-between rounded-[8px] border border-[#ECECEC] bg-white px-3">
            <TextInput
              value={services}
              onChangeText={setServices}
              placeholder="من 9 صباحا حتى 5 مساءا"
              placeholderTextColor="#979797"
              textAlign="right"
              className="flex-1 font-cairo-regular text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            />
            <CalendarClockIcon size={18} color="#111111" />
          </View>
        </View>
      </View>
    </View>
  );
}
