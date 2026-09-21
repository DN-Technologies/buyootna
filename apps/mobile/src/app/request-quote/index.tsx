import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  useId,
  useRef,
  useState,
} from 'react';
import {
  Image,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COMPANY_CATEGORY_OPTIONS } from '@/features/individual/components/companies/CategoryFilterSheet';
import InlineDropdown from '@/shared/components/filters/InlineDropdown';
import MapPickerModal from '@/shared/components/MapPickerModal';
import SuccessBottomSheet from '@/shared/components/SuccessBottomSheet';
import { getIdentityHomeRoute } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

const SPECIALTY_OPTIONS = COMPANY_CATEGORY_OPTIONS.filter(
  (option) => option.id !== 'all',
);

const REQUEST_TYPE_OPTIONS = [
  { id: 'quote', label: 'عرض سعر' },
  { id: 'consultation', label: 'استشارة' },
  { id: 'site_visit', label: 'معاينة موقع' },
  { id: 'full_project', label: 'تنفيذ مشروع كامل' },
];

const MAX_ATTACHMENTS = 10;

const inputStyle: TextStyle = {
  height: 44,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 16,
  fontFamily: 'Cairo-Medium',
  fontSize: 13,
  color: '#111111',
  textAlign: 'right',
};

export default function RequestQuoteScreen() {
  const router = useRouter();
  const activeIdentity = useAuthStore((state) => state.activeIdentity);
  const successSheetRef = useRef<BottomSheetModal>(null);
  const keyboardAccessoryId = useId();

  const [specialtyId, setSpecialtyId] = useState('');
  const [requestTypeId, setRequestTypeId] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [addressCoords, setAddressCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickAttachments = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          'إذن مطلوب',
          'نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك!',
          [{ text: 'حسناً' }],
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: MAX_ATTACHMENTS - attachments.length,
      });

      if (!result.canceled && result.assets) {
        setAttachments((prev) => [
          ...prev,
          ...result.assets.map((asset) => asset.uri),
        ]);
      }
    } catch (error) {
      console.error('Attachment picker error:', error);
      showAlert('خطأ', 'حدث خطأ أثناء اختيار الصور. حاول مرة أخرى.', [
        { text: 'حسناً' },
      ]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!specialtyId) {
      showAlert('تنبيه', 'يرجى اختيار مجال التخصص');
      return;
    }
    if (!addressLabel) {
      showAlert('تنبيه', 'يرجى تحديد العنوان على الخريطة');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate request submission
      await new Promise((resolve) => setTimeout(resolve, 800));
      successSheetRef.current?.present();
    } catch {
      showAlert('خطأ', 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* --- Header --- */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="w-8 items-end"
          >
            <Feather name="chevron-right" size={24} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-semibold text-lg text-[#111111]">
            تقديم طلب سعر
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- مجال التخصص --- */}
          <InlineDropdown
            title="مجال التخصص"
            placeholder="اختر نوع الخدمة أو اسم الشركة.."
            options={SPECIALTY_OPTIONS}
            value={specialtyId}
            onChange={setSpecialtyId}
          />

          {/* --- نوع الطلب --- */}
          <InlineDropdown
            title="نوع الطلب"
            placeholder="حدد الخدمة اللي ترغب بها"
            options={REQUEST_TYPE_OPTIONS}
            value={requestTypeId}
            onChange={setRequestTypeId}
          />

          {/* --- نطاق السعر --- */}
          <View className="mb-6 w-full">
            <View className="mb-2 flex-row items-center gap-1">
              <Text
                className="font-cairo-medium text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                نطاق السعر
              </Text>
              <Feather name="info" size={13} color="#94A3B8" />
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  value={priceTo}
                  onChangeText={setPriceTo}
                  placeholder="الى"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  inputAccessoryViewID={
                    Platform.OS === 'ios' ? keyboardAccessoryId : undefined
                  }
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  value={priceFrom}
                  onChangeText={setPriceFrom}
                  placeholder="من"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  inputAccessoryViewID={
                    Platform.OS === 'ios' ? keyboardAccessoryId : undefined
                  }
                  style={inputStyle}
                />
              </View>
            </View>
          </View>

          {/* --- العنوان --- */}
          <View className="mb-6 w-full">
            <Text
              className="mb-2 font-cairo-medium text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              العنوان
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowMapPicker(true)}
              className="h-12 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4"
            >
              <Text
                numberOfLines={1}
                className={`flex-1 leading-[22px] font-cairo text-sm ${
                  addressLabel ? 'text-[#111111]' : 'text-[#94A3B8]'
                }`}
                style={{ writingDirection: 'rtl' }}
              >
                {addressLabel || 'حدد عنوانك على الخريطة'}
              </Text>
              <Feather name="map-pin" size={18} color="#15304D" />
            </TouchableOpacity>
          </View>

          {/* --- وصف --- */}
          <View className="mb-6 w-full">
            <Text
              className="mb-2 font-cairo-medium text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              وصف
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="اشرح تفاصيل الخدمة المطلوبة..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              inputAccessoryViewID={
                Platform.OS === 'ios' ? keyboardAccessoryId : undefined
              }
              style={[inputStyle, { height: 100, paddingTop: 12 }]}
            />
          </View>

          {/* --- مرفقات --- */}
          <View className="mb-2 w-full">
            <View className="mb-2 flex-row items-center gap-1">
              <Text
                className="font-cairo-medium text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                مرفقات
              </Text>
              <Feather name="info" size={13} color="#94A3B8" />
            </View>

            {attachments.length > 0 && (
              <View className="mb-3 flex-row flex-wrap gap-3">
                {attachments.map((uri, index) => (
                  <View
                    key={uri + index}
                    className="relative h-[80px] w-[80px] overflow-hidden rounded-lg border border-gray-200"
                  >
                    <Image
                      source={{ uri }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => removeAttachment(index)}
                      className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500"
                    >
                      <Feather name="x" size={11} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickAttachments}
              className="w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-6"
            >
              <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-[#F4F8FB]">
                <Feather name="upload" size={20} color="#15304D" />
              </View>
              <Text className="mb-1 font-cairo-semibold text-sm text-[#111111]">
                اضغط هنا لرفع الصور
              </Text>
              <Text className="px-6 text-center font-cairo-medium text-[11px] leading-5 text-[#94A3B8]">
                الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* --- Submit Button --- */}
        <View className="border-t border-gray-100 px-5 py-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-bold text-base text-white">
              {isSubmitting ? 'جارِ الإرسال...' : 'ارسال الطلب'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={keyboardAccessoryId}>
          <View className="flex-row items-center justify-end border-t border-gray-200 bg-[#F8FAFC] px-4 py-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Keyboard.dismiss()}
            >
              <Text className="font-cairo-bold text-[15px] text-[#15304D]">
                تم
              </Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      <MapPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={(addressName, lat, lng) => {
          setAddressLabel(addressName);
          setAddressCoords({ lat, lng });
          setShowMapPicker(false);
        }}
        initialLat={addressCoords?.lat}
        initialLng={addressCoords?.lng}
        initialAddressLabel={addressLabel || undefined}
      />

      <SuccessBottomSheet
        ref={successSheetRef}
        title="تم إرسال طلبك بنجاح"
        description="تم إرسال طلبك إلى الشركات المناسبة، وستتلقى عروض الأسعار قريباً."
        buttonText="متابعة العروض"
        onPress={() => {
          successSheetRef.current?.dismiss();
          router.replace('/activity');
        }}
        secondaryButtonText="العودة للرئيسية"
        onSecondaryPress={() => {
          successSheetRef.current?.dismiss();
          router.replace(getIdentityHomeRoute(activeIdentity?.type));
        }}
      />
    </SafeAreaView>
  );
}
