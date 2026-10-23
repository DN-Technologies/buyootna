import { Image } from 'expo-image';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DESCRIPTION_MAX_LENGTH,
  MAX_IMAGES,
} from '@/features/company/components/add-project/useAddProject';
import FieldLabel from '@/features/company/components/invoice/FieldLabel';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';

import CompanyFormHeader from '../CompanyFormHeader';
import CompanySubmitButton from '../CompanySubmitButton';
import { formatCreatedDate } from './portfolio.utils';
import { useEditProject } from './useEditProject';

const inputClassName =
  'w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

/** تعديل المشروع (Figma 4410:169654 / 8464:26503). */
export default function EditProjectScreen({ projectId }: { projectId: string }) {
  const edit = useEditProject(projectId);
  const { project } = edit;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <CompanyFormHeader title={project?.title ?? ''} onBack={edit.goBack} />

      {!project ? (
        <View className="px-4 pt-4">
          {edit.isLoading ? (
            [1, 2, 3].map((key) => <ListRowSkeleton key={key} showIcon={false} />)
          ) : (
            <Text
              className="pt-10 text-center font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              المشروع غير موجود
            </Text>
          )}
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, gap: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-5">
              {/* حالة ظهور المشروع: text on the right, toggle on the left */}
              <View className="flex-row items-center gap-3 rounded-[8px] bg-[#F5F7F9] p-3">
                <View className="flex-1 gap-3 py-[6px]">
                  <Text
                    className="font-cairo-semibold text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    حالة ظهور المشروع
                  </Text>
                  <Text
                    className="font-cairo-medium text-[12px] text-[#6B6A6A]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    إطفاء الزر يخفي المشروع مؤقتاً دون حذفه
                  </Text>
                </View>
                <Switch
                  testID="edit-project-visibility"
                  value={edit.isVisible}
                  onValueChange={edit.setIsVisible}
                  trackColor={{ true: '#15304D', false: '#D7D7D7' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#D7D7D7"
                />
              </View>

              <View className="gap-1.5">
                <FieldLabel text="عنوان المشروع" />
                <TextInput
                  testID="edit-project-title"
                  value={edit.title}
                  onChangeText={edit.setTitle}
                  maxLength={100}
                  placeholderTextColor="#979797"
                  className={`h-[56px] ${inputClassName}`}
                  style={{ writingDirection: 'rtl' }}
                />
              </View>

              <View className="gap-1">
                <View className="gap-1.5">
                  <FieldLabel text="الوصف" />
                  <TextInput
                    testID="edit-project-description"
                    value={edit.description}
                    onChangeText={edit.setDescription}
                    multiline
                    textAlignVertical="top"
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    className={`min-h-[104px] pb-4 pt-4 ${inputClassName}`}
                    style={{ writingDirection: 'rtl' }}
                  />
                </View>
                <Text
                  className="font-cairo-medium text-[11px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  يجب أن لا يتخطى الوصف {DESCRIPTION_MAX_LENGTH} حرف.
                </Text>
              </View>

              {/* الصور: each with remove and replace, then «اضافة صورة» */}
              <View className="gap-4">
                <View className="gap-3">
                  <Text
                    className="font-cairo-medium text-[14px] text-black"
                    style={{ writingDirection: 'rtl' }}
                  >
                    الصور
                  </Text>
                  <View className="flex-row gap-2">
                    {edit.images.map((uri, index) => (
                      <View
                        key={`${index}-${uri}`}
                        testID={`edit-project-image-${index}`}
                        className="h-[72px] w-[109px] overflow-hidden rounded-[2px]"
                      >
                        <Image
                          source={{ uri }}
                          contentFit="cover"
                          style={{ width: 109, height: 72 }}
                        />
                        <View className="absolute inset-0 flex-row items-center justify-center gap-3 bg-black/40">
                          <TouchableOpacity
                            testID={`edit-project-image-remove-${index}`}
                            accessibilityLabel="حذف الصورة"
                            onPress={() => edit.removeImage(index)}
                          >
                            <Image
                              source={require('@/assets/icons/portfolio/image-trash.svg')}
                              style={{ width: 24, height: 24 }}
                              contentFit="contain"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            testID={`edit-project-image-replace-${index}`}
                            accessibilityLabel="تغيير الصورة"
                            onPress={() => void edit.replaceImage(index)}
                          >
                            <Image
                              source={require('@/assets/icons/portfolio/image-edit.svg')}
                              style={{ width: 24, height: 24 }}
                              contentFit="contain"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
                {edit.images.length < MAX_IMAGES && (
                  <TouchableOpacity
                    testID="edit-project-add-image"
                    activeOpacity={0.7}
                    onPress={() => void edit.addImages()}
                    className="h-10 w-full items-center justify-center rounded-[20px] border border-[#E2E8F0] bg-white"
                  >
                    <Text className="font-cairo-bold text-[14px] text-[#111111]">
                      اضافة صورة
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text
              className="font-cairo-medium text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              تاريخ الانشاء: {formatCreatedDate(project.createdAt)}
            </Text>

            <TouchableOpacity
              testID="edit-project-delete"
              activeOpacity={0.8}
              onPress={edit.askToDelete}
              className="h-12 w-full items-center justify-center rounded-[24px] border border-[#9C1E28]"
            >
              <Text className="font-cairo-bold text-[14px] tracking-[0.28px] text-[#9C1E28]">
                حذف المشروع نهائيا
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View
            className="bg-white px-3 pb-8 pt-4"
            style={{
              shadowColor: '#9D9D9D',
              shadowOpacity: 0.25,
              shadowRadius: 2.45,
              shadowOffset: { width: -2, height: 0 },
              elevation: 4,
            }}
          >
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
        title="هل أنت متأكد من حذف هذا المشروع؟"
        description="سيتم حذف جميع الصور الخاصة به ولن يظهر بعد الآن في معرض الأعمال."
        confirmLabel="حذف المشروع"
        iconBackground="#FFEBEB"
        icon={
          <Image
            source={require('@/assets/icons/portfolio/delete-trash.svg')}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
        }
        onConfirm={() => void edit.confirmDelete()}
      />
    </SafeAreaView>
  );
}
