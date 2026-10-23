import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyCompanyServices } from '@/features/company/hooks/useMyCompanyServices';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import UndoToast from '@/shared/components/ui/UndoToast';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import CompanyFormHeader from '../CompanyFormHeader';
import HeaderOptionsMenu from '../HeaderOptionsMenu';
import AddSubServiceSheet from './AddSubServiceSheet';
import { serviceName } from './services.utils';
import ServicesEmptyState from './ServicesEmptyState';
import ServiceSwitch from './ServiceSwitch';
import { useAddSubService } from './useAddSubService';
import { useServicesActions } from './useServicesActions';
import { serviceVisibilityMessage, useServicesToast } from './useServicesToast';

// Figma 4410:169834's card text, shown while the service has no description
const SERVICES_CARD_TEXT =
  'سيتم إخفاء جميع الخدمات من صفحتك ولن يتمكن العملاء من رؤيتها وطلبها حالياً. يمكنك إعادة تفعيلها في أي وقت بنقرة واحدة.';

const failed = (title: string) => (error: unknown) =>
  showAlert(title, getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'), [
    { text: 'حسناً' },
  ]);

/**
 * More › الخدمات (Figma 4410:169834): the specialty and its description,
 * each sub-service with its visibility switch, ⋮ to hide or delete the
 * whole service, «تعديل» and «اضافة خدمة فرعية».
 */
export default function ServicesScreen() {
  const router = useRouter();
  const { services, specialty, servicesHidden, description, isLoading, refetch } =
    useMyCompanyServices();
  const { setServiceHidden, updateServices, deleteAll } = useServicesActions();
  const { toast, show: showToast, clear: clearToast } = useServicesToast();
  const add = useAddSubService(specialty ?? '', services);

  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const deleteAllRef = useRef<BottomSheetModal>(null);
  const isEmpty = !isLoading && services.length === 0;

  // A switch flips its row: a visible one is hidden, a hidden one shown
  const toggleRow = async (id: string, visible: boolean) => {
    setPendingId(id);
    try {
      // A visible row becomes hidden, a hidden one visible
      await setServiceHidden(id, visible);
      showToast(serviceVisibilityMessage(visible), () =>
        setServiceHidden(id, !visible),
      );
    } catch (error) {
      failed('تعذر تحديث الخدمة')(error);
    } finally {
      setPendingId(null);
    }
  };

  const toggleWhole = async () => {
    const hide = !servicesHidden;
    try {
      await updateServices({ servicesHidden: hide });
      showToast(serviceVisibilityMessage(hide), () =>
        updateServices({ servicesHidden: !hide }),
      );
    } catch (error) {
      failed('تعذر تحديث الخدمة')(error);
    }
  };

  const undoToast = () => {
    const undo = toast?.undo;
    clearToast();
    undo?.().catch(failed('تعذر التراجع'));
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <CompanyFormHeader
        title="الخدمات"
        onBack={() => router.back()}
        trailing={
          <TouchableOpacity
            testID="services-options"
            accessibilityLabel="خيارات"
            activeOpacity={0.7}
            onPress={() => setMenuOpen(true)}
            disabled={isEmpty || isLoading}
            className={`h-8 w-8 items-center justify-center rounded-full ${
              isEmpty ? 'opacity-0' : ''
            }`}
          >
            {/* As the company profile's ⋮ (the Figma SVG's mask drew broken dots) */}
            <Feather name="more-vertical" size={20} color="#111111" />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View className="px-4 pt-4">
          {[1, 2, 3].map((key) => (
            <ListRowSkeleton key={key} showIcon={false} />
          ))}
        </View>
      ) : isEmpty ? (
        <ServicesEmptyState onAdd={() => router.push('/add-service')} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        >
          {/* The specialty and its description */}
          <View
            testID="services-specialty"
            className="gap-3 rounded-[6px] border-[1.2px] border-[#ECECEC] bg-white/80 p-[14px]"
          >
            <View className="flex-row items-center gap-2">
              <Text
                className="flex-1 font-cairo-bold text-[16px] leading-[22px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {specialty}
              </Text>
              {servicesHidden && (
                <View testID="services-hidden-badge" className="rounded-[8px] bg-[#F5F7F9] px-2 py-[2px]">
                  <Text className="font-almarai-regular text-[12px] text-[#6B6A6A]">مخفية</Text>
                </View>
              )}
            </View>
            {/* The service's description, else the Figma card's text */}
            <Text
              testID="services-description"
              className="font-cairo text-[13px] leading-[20px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {description || SERVICES_CARD_TEXT}
            </Text>
          </View>

          <View className="gap-3">
            <Text
              className="font-cairo-bold text-[13px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              الخدمات الفرعية
            </Text>
            {services.map((service) => {
              const visible = !service.isHidden;
              return (
                <View
                  key={service.id}
                  testID={`service-row-${service.id}`}
                  className="flex-row items-center gap-3 rounded-[8px] bg-[#F5F7F9] p-3"
                >
                  <Text
                    className={`flex-1 font-cairo-medium text-[14px] leading-[21px] ${
                      visible ? 'text-[#111111]' : 'text-[#A0A0A0]'
                    }`}
                    style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
                  >
                    {serviceName(service)}
                  </Text>
                  <ServiceSwitch
                    testID={`service-switch-${service.id}`}
                    value={visible}
                    disabled={pendingId === service.id}
                    onValueChange={() => void toggleRow(service.id, visible)}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* «تعديل» on the right, «اضافة خدمة فرعية» on the left */}
      {!isLoading && !isEmpty && (
        <View
          className="flex-row gap-[10px] bg-white px-3 pb-8 pt-4"
          style={{
            shadowColor: '#9D9D9D',
            shadowOpacity: 0.25,
            shadowRadius: 2.45,
            shadowOffset: { width: -2, height: 0 },
            elevation: 4,
          }}
        >
          <TouchableOpacity
            testID="services-edit"
            activeOpacity={0.8}
            onPress={() => router.push('/edit-service')}
            className="h-12 flex-1 items-center justify-center rounded-[24px] bg-[#15304D]"
          >
            <Text className="font-cairo-bold text-[16px] text-white">تعديل</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="services-add-sub"
            activeOpacity={0.8}
            onPress={add.open}
            className="h-12 flex-1 items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
          >
            <Text className="font-cairo-semibold text-[14px] text-[#111111]">
              اضافة خدمة فرعية
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <UndoToast
        visible={!!toast}
        message={toast?.message ?? ''}
        onUndo={undoToast}
        onDismiss={clearToast}
        testID="services-toast"
      />

      <HeaderOptionsMenu
        testID="services-menu"
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        options={[
          {
            label: servicesHidden ? 'اظهار الخدمة' : 'اخفاء الخدمة',
            onPress: () => void toggleWhole(),
            testID: 'services-menu-toggle-hidden',
          },
          {
            label: 'حذف الخدمة نهائيا',
            onPress: () => deleteAllRef.current?.present(),
            testID: 'services-menu-delete',
            danger: true,
          },
        ]}
      />

      <ConfirmActionSheet
        ref={deleteAllRef}
        variant="danger"
        title="حذف الخدمة نهائياً؟"
        description={`هل أنت متأكد من حذف خدمة ${specialty ?? ''} ؟ سيتم إزالتها تماماً من حسابك ولن تظهر للعملاء مجدداً.`}
        confirmLabel="حذف الخدمة"
        iconBackground="#FFEBEB"
        icon={
          <Image
            source={require('@/assets/icons/services/delete-trash.svg')}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
        }
        onConfirm={() => void deleteAll().catch(failed('فشل حذف الخدمة'))}
      />

      {!!specialty && <AddSubServiceSheet add={add} />}
    </SafeAreaView>
  );
}
