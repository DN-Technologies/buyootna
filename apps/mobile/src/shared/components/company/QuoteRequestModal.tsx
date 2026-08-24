import { Feather } from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  InputAccessoryView,
  Keyboard,
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

import InlineDropdown from '@/shared/components/filters/InlineDropdown';
import MapPickerModal from '@/shared/components/MapPickerModal';
import { showAlert } from '@/shared/utils/alert';

interface ServiceItem {
  id: string;
  title: string;
}

interface QuoteRequestModalProps {
  companyName?: string;
  companySubtitle?: string;
  companyLogoUrl?: string;
  services?: ServiceItem[];
  onRequestSubmitted?: () => void;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: '1', title: 'الأثاث' },
  { id: '2', title: 'شبكات نت' },
  { id: '3', title: 'ديكورات وتصميم' },
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

const QuoteRequestModal = forwardRef<BottomSheetModal, QuoteRequestModalProps>(
  (
    {
      companyName = 'الشركة',
      companySubtitle,
      companyLogoUrl,
      services = DEFAULT_SERVICES,
      onRequestSubmitted,
    },
    ref,
  ) => {
    const internalRef = useRef<BottomSheetModal>(null);
    const keyboardAccessoryId = useId();

    useImperativeHandle(ref, () => internalRef.current as BottomSheetModal);

    const [serviceId, setServiceId] = useState('');
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

    const dropdownOptions = services.map((svc) => ({
      id: svc.id,
      label: svc.title,
    }));

    const resetForm = () => {
      setServiceId('');
      setPriceFrom('');
      setPriceTo('');
      setAddressLabel('');
      setAddressCoords(null);
      setDescription('');
      setAttachments([]);
    };

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
      if (!serviceId) {
        showAlert('تنبيه', 'يرجى اختيار نوع الطلب');
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
        showAlert(
          'تم بنجاح',
          `تم إرسال طلب عرض السعر إلى ${companyName} بنجاح!`,
        );
        internalRef.current?.dismiss();
        if (onRequestSubmitted) {
          onRequestSubmitted();
        }
      } catch {
        showAlert('خطأ', 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <BottomSheetModal
        ref={internalRef}
        snapPoints={['94%']}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 24 }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onDismiss={resetForm}
      >
        {/* Header Row */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-6 pb-3 pt-2">
          <Text className="font-cairo-semibold text-[18px] text-[#111111]">
            تقديم طلب سعر
          </Text>
          <TouchableOpacity
            onPress={() => internalRef.current?.dismiss()}
            className="h-8 w-8 items-center justify-center rounded-full"
          >
            <Feather name="x" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Company Info Card */}
          <View className="mb-6 flex-row items-center gap-3 rounded-xl bg-[#F5F7F9] p-3">
            <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#111111]">
              {companyLogoUrl ? (
                <ExpoImage
                  source={{ uri: companyLogoUrl }}
                  className="h-full w-full"
                  contentFit="cover"
                />
              ) : (
                <Feather name="briefcase" size={20} color="#FFFFFF" />
              )}
            </View>
            <View className="flex-1">
              <Text
                className="font-cairo-bold text-[14px] text-[#15304D]"
                style={{ writingDirection: 'rtl' }}
              >
                {companyName}
              </Text>
              {!!companySubtitle && (
                <Text
                  numberOfLines={1}
                  className="font-cairo text-[14px] text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {companySubtitle}
                </Text>
              )}
            </View>
          </View>

          {/* نوع الطلب */}
          <InlineDropdown
            title="نوع الطلب"
            placeholder="حدد الخدمة التي ترغب بها"
            options={dropdownOptions}
            value={serviceId}
            onChange={setServiceId}
          />

          {/* نطاق السعر */}
          <View className="mb-6 w-full">
            <View className="mb-2 flex-row items-center gap-1">
              <Text
                className="font-cairo-medium text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                نطاق السعر
              </Text>
              <Feather name="info" size={13} color="#94A3B8" />
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <BottomSheetTextInput
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
                <BottomSheetTextInput
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

          {/* العنوان */}
          <View className="mb-6 w-full">
            <Text
              className="mb-2 font-cairo-medium text-[14px] text-[#111111]"
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
                className={`flex-1 font-cairo text-[14px] ${
                  addressLabel ? 'text-[#111111]' : 'text-[#979797]'
                }`}
                style={{ writingDirection: 'rtl' }}
              >
                {addressLabel || 'حدد عنوانك على الخريطة'}
              </Text>
              <Feather name="map-pin" size={18} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* وصف */}
          <View className="mb-6 w-full">
            <Text
           className="mb-2 font-cairo-medium text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              وصف
            </Text>
            <BottomSheetTextInput
              value={description}
              onChangeText={setDescription}
              placeholder="اشرح تفاصيل الخدمة المطلوبة..."
              placeholderTextColor="#979797"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              inputAccessoryViewID={
                Platform.OS === 'ios' ? keyboardAccessoryId : undefined
              }
              style={[inputStyle, { height: 100, paddingTop: 12 }]}
            />
          </View>

          {/* مرفقات */}
          <View className="mb-2 w-full">
            <View className="mb-2 flex-row items-center gap-1">
              <Text
                className="font-cairo-medium text-[14px] text-[#111111]"
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
        </BottomSheetScrollView>

        {/* Submit Button */}
        <View className="border-t border-gray-100 px-6 pb-8 pt-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="w-full items-center justify-center rounded-full bg-[#15304D] py-3.5"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="font-cairo-bold leading-[24px] text-base text-white">
                إرسال الطلب
              </Text>
            )}
          </TouchableOpacity>
        </View>

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
      </BottomSheetModal>
    );
  },
);

QuoteRequestModal.displayName = 'QuoteRequestModal';

export default QuoteRequestModal;
