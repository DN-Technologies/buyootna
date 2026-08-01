import { Feather } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import  { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ServiceItem {
  id: string;
  title: string;
}

interface QuoteRequestModalProps {
  companyName?: string;
  services?: ServiceItem[];
  onRequestSubmitted?: () => void;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: '1', title: 'الأثاث' },
  { id: '2', title: 'شبكات نت' },
  { id: '3', title: 'ديكورات وتصميم' },
];

const QuoteRequestModal = forwardRef<BottomSheetModal, QuoteRequestModalProps>(
  ({ companyName = 'الشركة', services = DEFAULT_SERVICES, onRequestSubmitted }, ref) => {
    const internalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => internalRef.current as BottomSheetModal);

    const [selectedServiceId, setSelectedServiceId] = useState<string>(
      services[0]?.id || '',
    );
    const [details, setDetails] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (!phone.trim()) {
        Alert.alert('تنبيه', 'يرجى إدخال رقم الهاتف للتواصل');
        return;
      }

      try {
        setIsSubmitting(true);
        // Simulate request submission
        await new Promise((resolve) => setTimeout(resolve, 800));
        Alert.alert('تم بنجاح', `تم إرسال طلب عرض السعر إلى ${companyName} بنجاح!`);
        internalRef.current?.dismiss();
        setDetails('');
        setPhone('');
        if (onRequestSubmitted) {
          onRequestSubmitted();
        }
      } catch {
        Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <BottomSheetModal
        ref={internalRef}
        snapPoints={['65%']}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 24 }}
      >
        <BottomSheetView className="flex-1 px-6 pt-2 pb-8">
          {/* Header Row */}
          <View className="mb-4 flex-row items-center justify-between border-b border-gray-100 pb-3">
            <TouchableOpacity
              onPress={() => internalRef.current?.dismiss()}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
            >
              <Feather name="x" size={18} color="#111111" />
            </TouchableOpacity>
            <Text className="font-cairo-bold text-lg text-[#111111]">
              طلب عرض سعر
            </Text>
          </View>

          {/* Select Service */}
          <Text className="mb-2 text-right font-cairo-semibold text-sm text-[#111111]">
            اختر الخدمة المطلوب الاستفسار عنها:
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2 justify-end">
            {services.map((svc) => {
              const isSelected = selectedServiceId === svc.id;
              return (
                <TouchableOpacity
                  key={svc.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedServiceId(svc.id)}
                  className={`rounded-xl border px-4 py-2 ${
                    isSelected
                      ? 'border-[#15304D] bg-[#15304D]'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <Text
                    className={`font-cairo-semibold text-xs ${
                      isSelected ? 'text-white' : 'text-[#6B6A6A]'
                    }`}
                  >
                    {svc.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Phone Number Input */}
          <Text className="mb-1 text-right font-cairo-semibold text-sm text-[#111111]">
            رقم الهاتف:
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="أدخل رقم الهاتف"
            keyboardType="phone-pad"
            className="mb-4 rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-3 text-right font-cairo-medium text-sm text-[#111111]"
          />

          {/* Details / Notes */}
          <Text className="mb-1 text-right font-cairo-semibold text-sm text-[#111111]">
            تفاصيل الطلب (اختياري):
          </Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="اكتب تفاصيل مشروعك أو استفسارك هنا..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="mb-6 h-24 rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-3 text-right font-cairo-medium text-sm text-[#111111]"
          />

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="w-full items-center justify-center rounded-full bg-[#15304D] py-3.5"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="font-cairo-bold text-base text-white">
                إرسال الطلب
              </Text>
            )}
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

QuoteRequestModal.displayName = 'QuoteRequestModal';

export default QuoteRequestModal;
