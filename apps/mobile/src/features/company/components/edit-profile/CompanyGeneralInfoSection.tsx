import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LocationPinIcon } from '@/assets/icons/more';
import EmailField from '@/shared/components/forms/EmailField';
import EmailVerificationHint from '@/shared/components/forms/EmailVerificationHint';
import FieldLabel from '@/shared/components/forms/FieldLabel';
import KuwaitPhoneField from '@/shared/components/forms/KuwaitPhoneField';
import PhoneVerificationHint from '@/shared/components/forms/PhoneVerificationHint';
import type { ProfileFormData } from '@/shared/components/forms/types';
import MapPickerModal from '@/shared/components/map/MapPickerModal';
import IdentityContactPhone from '@/shared/components/profile/IdentityContactPhone';
import WorkingHoursField from '@/shared/components/profile/WorkingHoursField';
import { ABOUT_MAX_LENGTH } from '@/shared/utils/location';

import type { CompanyIdentityFields } from './useCompanyEditProfile';

// The Figma input look (4410:159865) -- the shared fields adopt it via
// their style-override props so both screens stay visually on-design.
const LABEL_CLASS = 'mb-1.5 font-cairo-medium text-[14px] text-[#111111]';
const INPUT_CLASS =
  'h-[46px] rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-[14px] text-[#111111]';
const PILL_CLASS =
  'h-[46px] flex-row items-center justify-center gap-1.5 rounded-[8px] border border-[#ECECEC] bg-white px-3';
const PILL_TEXT_CLASS = 'font-cairo-regular text-[14px] text-[#979797]';

interface CompanyGeneralInfoSectionProps {
  control: Control<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  identity: CompanyIdentityFields;
  setIdentityField: <K extends keyof CompanyIdentityFields>(
    key: K,
    value: CompanyIdentityFields[K],
  ) => void;
  onOpenServiceAreas: () => void;
  // Verification wiring (new email/phone must be proven before saving)
  emailNeedsCode: boolean;
  sendEmailCode: () => void;
  phoneChanged: boolean;
  needsPhoneVerification: boolean;
  verifySavedPhone: () => void;
}

export default function CompanyGeneralInfoSection({
  control,
  errors,
  identity,
  setIdentityField,
  onOpenServiceAreas,
  emailNeedsCode,
  sendEmailCode,
  phoneChanged,
  needsPhoneVerification,
  verifySavedPhone,
}: CompanyGeneralInfoSectionProps) {
  // المقر الرئيسي's map
  const [showMap, setShowMap] = useState(false);
  return (
    <View>
      <Text
        className="mb-3 font-cairo-semibold text-[17px] text-black"
        style={{ writingDirection: 'rtl' }}
      >
        عن الشركة
      </Text>

      <View className="gap-4">
        {/* Field: الاسم (company names may contain digits/symbols, so no
            NAME_REGEX here -- unlike the individual NameField) */}
        <View>
          <FieldLabel className={LABEL_CLASS}>الاسم</FieldLabel>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="أدخل اسم الشركة"
                placeholderTextColor="#979797"
                textAlign="right"
                className={INPUT_CLASS}
              />
            )}
          />
        </View>

        {/* Field: البريد الالكتروني (a new address needs its emailed code) */}
        <EmailField
          control={control}
          errors={errors}
          labelClassName={LABEL_CLASS}
          inputClassName={INPUT_CLASS}
          showOptional={false}
        >
          <EmailVerificationHint
            visible={emailNeedsCode}
            onSend={sendEmailCode}
          />
        </EmailField>

        {/* Field: رقم الهاتف (a new number is proven with an SMS code on save) */}
        <KuwaitPhoneField
          control={control}
          errors={errors}
          name="phone"
          label="رقم الهاتف"
          requiredMessage="رقم الهاتف مطلوب"
          // Always required (it's how people reach you); checked on save
          requiredInForm={false}
          labelClassName={LABEL_CLASS}
          inputClassName={INPUT_CLASS}
          pillClassName={PILL_CLASS}
          pillTextClassName={PILL_TEXT_CLASS}
          pillIconColor="#979797"
        >
          <PhoneVerificationHint
            phoneChanged={phoneChanged}
            needsVerification={needsPhoneVerification}
            onVerify={verifySavedPhone}
          />
        </KuwaitPhoneField>

        {/* رقم التواصل: the account's phone or the company's own line.
            No WhatsApp: companies are reached by phone or in-app chat */}
        <IdentityContactPhone />

        {/* Field: المقر الرئيسي, picked on the map (address + point) */}
        <View>
          <FieldLabel className={LABEL_CLASS}>المقر الرئيسي</FieldLabel>
          <TouchableOpacity
            testID="hq-location-field"
            activeOpacity={0.7}
            onPress={() => setShowMap(true)}
            className="h-[46px] flex-row items-center justify-between gap-2 rounded-[8px] border border-[#ECECEC] bg-white px-3"
          >
            <Text
              numberOfLines={1}
              className={`flex-1 font-cairo-regular text-[14px] leading-[22px] ${identity.hqLocation ? 'text-[#111111]' : 'text-[#979797]'}`}
              style={{ writingDirection: 'rtl' }}
            >
              {identity.hqLocation || 'حدد المقر على الخريطة'}
            </Text>
            <LocationPinIcon size={16} color="#15304D" />
          </TouchableOpacity>
          <MapPickerModal
            visible={showMap}
            onClose={() => setShowMap(false)}
            onConfirm={(addressName, lat, lng) => {
              setIdentityField('hqLocation', addressName);
              setIdentityField('latitude', String(lat));
              setIdentityField('longitude', String(lng));
              setShowMap(false);
            }}
            initialLat={identity.latitude ? Number(identity.latitude) : undefined}
            initialLng={identity.longitude ? Number(identity.longitude) : undefined}
            initialAddressLabel={identity.hqLocation || undefined}
          />
        </View>

        {/* Field: مناطق تقديم الخدمة */}
        <View>
          <FieldLabel className={LABEL_CLASS}>مناطق تقديم الخدمة</FieldLabel>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenServiceAreas}
            className="h-[46px] flex-row items-center justify-between rounded-[8px] border border-[#ECECEC] bg-white px-3"
          >
            <Text
              numberOfLines={1}
              className={`flex-1 font-cairo-regular text-[14px] leading-[22px] ${identity.serviceAreas ? 'text-[#111111]' : 'text-[#979797]'}`}
              // No textAlign: 'right' (swapped to the left in the app's
              // forced RTL); the rtl writing direction starts it right
              style={{ writingDirection: 'rtl' }}
            >
              {identity.serviceAreas || 'اختر نطاقات الخدمة'}
            </Text>
            <Feather name="chevron-down" size={16} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Field: نبذة عن الشركة (Multiline Textarea) */}
        <View>
          <FieldLabel className={LABEL_CLASS}>نبذة عن الشركة</FieldLabel>
          <View className="min-h-[110px] rounded-[8px] border border-[#ECECEC] bg-white p-3">
            <TextInput
              value={identity.about}
              onChangeText={(val) => setIdentityField('about', val)}
              multiline
              numberOfLines={4}
              maxLength={ABOUT_MAX_LENGTH}
              placeholder="اكتب نبذة عن الشركة"
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
          <Text
            testID="about-counter"
            className="mt-1 font-cairo-medium text-[10px] leading-[16px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {identity.about.length}/{ABOUT_MAX_LENGTH} حرف
          </Text>
        </View>

        {/* Field: مواعيد العمل (day by day, like WhatsApp Business) */}
        <WorkingHoursField
          value={identity.workingHours}
          onChange={(week) =>
            setIdentityField('workingHours', JSON.stringify(week))
          }
          labelClassName={LABEL_CLASS}
        />
      </View>
    </View>
  );
}
