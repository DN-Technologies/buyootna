import { Image } from 'expo-image';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DESCRIPTION_MAX_LENGTH } from '@/features/company/components/add-service/useAddService';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';

import CompanyFormHeader from '../CompanyFormHeader';
import CompanySubmitButton from '../CompanySubmitButton';
import { formatCreatedDate } from '../portfolio/portfolio.utils';
import AddSubServiceSheet from './AddSubServiceSheet';
import { serviceName, servicesSummary } from './services.utils';
import ServiceSwitch from './ServiceSwitch';
import { useAddSubService } from './useAddSubService';
import { useEditService } from './useEditService';

/** تعديل الخدمة. */
export default function EditServiceScreen() {
  const edit = useEditService();
  const add = useAddSubService(edit.specialty ?? '', edit.services);
  const rowsForSummary = edit.services.map((s) => ({
    isHidden: edit.hidden[s.id] ?? s.isHidden,
  }));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <CompanyFormHeader title="تعديل الخدمة" onBack={edit.goBack} />

      {edit.isLoading ? (
        <View className="px-4 pt-4">
          {[1, 2, 3].map((key) => (
            <ListRowSkeleton key={key} showIcon={false} />
          ))}
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, gap: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* The whole service: text on the right, switch on the left */}
            <View className="flex-row items-center gap-3 rounded-[8px] bg-[#F5F7F9] p-3">
              <View className="flex-1 gap-3 py-[6px]">
                <Text
                  className="font-cairo-semibold text-[15px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {edit.specialty}
                </Text>
                <Text
                  className="font-cairo-medium text-[13px] text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  إطفاء الزر يخفي الخدمة مؤقتاً دون حذفها
                </Text>
              </View>
              <ServiceSwitch
                testID="edit-service-visibility"
                value={edit.isVisible}
                onValueChange={edit.setIsVisible}
              />
            </View>

            {/* الخدمات الفرعية: opens and closes */}
            <View className="gap-4">
              <TouchableOpacity
                testID="edit-service-toggle-list"
                activeOpacity={0.7}
                onPress={edit.toggleExpanded}
                className="flex-row items-center gap-2"
              >
                <View className="flex-1 gap-3">
                  <Text
                    className="font-cairo-bold text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    الخدمات الفرعية
                  </Text>
                  {!edit.isExpanded && (
                    <Text
                      testID="edit-service-summary"
                      className="font-cairo text-[13px] text-[#6B6A6A]"
                      style={{ writingDirection: 'rtl' }}
                    >
                      {servicesSummary(rowsForSummary)}
                    </Text>
                  )}
                </View>
                {/* The frame turns its chevron assets: up when open, down
                    when closed (Figma rotate-90 / -rotate-90) */}
                <Image
                  source={
                    edit.isExpanded
                      ? require('@/assets/icons/services/chevron-open.svg')
                      : require('@/assets/icons/services/chevron-closed.svg')
                  }
                  style={{
                    width: 16,
                    height: 16,
                    transform: [{ rotate: edit.isExpanded ? '90deg' : '-90deg' }],
                  }}
                  contentFit="contain"
                />
              </TouchableOpacity>

              {edit.isExpanded && (
                <View className="gap-3">
                  {edit.services.map((service) => {
                    const visible = !edit.hidden[service.id];
                    return (
                      <View
                        key={service.id}
                        testID={`edit-service-row-${service.id}`}
                        className="flex-row items-center gap-3 rounded-[8px] bg-[#F5F7F9] p-3"
                      >
                        <Text
                          className={`flex-1 font-cairo-medium text-[14px] ${
                            visible ? 'text-[#111111]' : 'text-[#A0A0A0]'
                          }`}
                          style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
                        >
                          {serviceName(service)}
                        </Text>
                        <ServiceSwitch
                          testID={`edit-service-switch-${service.id}`}
                          value={visible}
                          onValueChange={() => edit.toggleRow(service.id)}
                        />
                        <TouchableOpacity
                          testID={`edit-service-delete-${service.id}`}
                          accessibilityLabel={`حذف ${serviceName(service)}`}
                          onPress={() => edit.askToDelete(service)}
                          className="h-6 w-6 items-center justify-center rounded-full bg-[#FFEBEB]"
                        >
                          <Image
                            source={require('@/assets/icons/services/row-trash.svg')}
                            style={{ width: 16, height: 16 }}
                            contentFit="contain"
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  <TouchableOpacity
                    testID="edit-service-add-sub"
                    activeOpacity={0.8}
                    onPress={add.open}
                    className="h-10 flex-row items-center justify-center gap-1 rounded-[24px] border border-[#15304D] bg-white"
                  >
                    <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
                      اضافة خدمة فرعية
                    </Text>
                    <Image
                      source={require('@/assets/icons/services/plus.svg')}
                      style={{ width: 16, height: 16 }}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="gap-3">
              <Text
                className="font-cairo-bold text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                الوصف
              </Text>
              <TextInput
                testID="edit-service-description"
                value={edit.description}
                onChangeText={edit.setDescription}
                multiline
                textAlignVertical="top"
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
                placeholderTextColor="#979797"
                className="min-h-[88px] w-full rounded-[6px] border border-[#ECECEC] bg-white px-3 pb-4 pt-4 text-right font-cairo text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              />
            </View>

            {!!edit.createdAt && (
              <Text
                className="font-cairo-medium text-[13px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                تاريخ الانشاء: {formatCreatedDate(edit.createdAt)}
              </Text>
            )}
          </ScrollView>

          <View className="bg-white px-4 pb-8 pt-3">
            <CompanySubmitButton
              label="حفظ التغييرات"
              disabled={!edit.canSave}
              onPress={() => void edit.save()}
            />
          </View>
        </KeyboardAvoidingView>
      )}

      <ConfirmActionSheet
        ref={edit.deleteSheetRef}
        variant="danger"
        title={`حذف خدمة ${edit.toDelete ? serviceName(edit.toDelete) : ''} ؟`}
        description={`هل أنت متأكد من حذف خدمة “${
          edit.toDelete ? serviceName(edit.toDelete) : ''
        }” ؟ سيتم إزالتها تماماً من حسابك ولن تظهر للعملاء مجدداً.`}
        confirmLabel="حذف الخدمة"
        iconBackground="#FFEBEB"
        icon={
          <Image
            source={require('@/assets/icons/services/delete-trash.svg')}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
        }
        onConfirm={() => void edit.confirmDelete()}
      />

      {!!edit.specialty && <AddSubServiceSheet add={add} />}
    </SafeAreaView>
  );
}
