import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { type Href, useRouter } from 'expo-router';
import { forwardRef, type ReactNode, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { CollectionsIcon, ReceiptIcon } from '@/assets/icons/company-add';
import { HeadsetIcon } from '@/assets/icons/company-home';
import CompanySheetHeader from '@/features/company/components/CompanySheetHeader';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

export interface CompanyActionsSheetProps {
  onClose?: () => void;
}

interface Action {
  id: string;
  label: string;
  href: Href;
  icon: ReactNode;
  // The first action is the filled navy one in Figma
  primary?: boolean;
}

const ACTIONS: Action[] = [
  {
    id: 'add-service',
    label: 'اضافة خدمة',
    href: '/add-service',
    icon: <HeadsetIcon size={20} color="#15304D" strokeWidth={1} />,
    primary: true,
  },
  {
    id: 'create-invoice',
    label: 'اصدار فاتورة',
    href: '/create-invoice',
    icon: <ReceiptIcon />,
  },
  {
    id: 'add-project',
    label: 'اضافة مشروع لمعرض الأعمال',
    href: '/add-project',
    icon: <CollectionsIcon />,
  },
];

/**
 * "إضافة جديد" (Figma 4410:166537): what the company tab bar's "+" opens.
 */
const CompanyActionsSheet = forwardRef<
  BottomSheetModal,
  CompanyActionsSheetProps
>(({ onClose }, ref) => {
  const router = useRouter();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const handleClose = () => {
    // @ts-ignore
    ref.current?.dismiss();
    if (onClose) onClose();
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      handleIndicatorStyle={{
        backgroundColor: '#000000',
        width: 45,
        height: 5,
      }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
    >
      <SafeBottomSheetView>
        <View className="gap-4 bg-white pb-10 pt-1">
          <CompanySheetHeader title="إضافة جديد" onClose={handleClose} />

          <View className="gap-3 px-4">
            {ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                testID={`company-action-${action.id}`}
                activeOpacity={0.8}
                onPress={() => {
                  handleClose();
                  router.push(action.href);
                }}
                className={`w-full flex-row items-center gap-2 rounded-[8px] border px-4 py-3 ${
                  action.primary
                    ? 'border-[#15304D] bg-[#15304D]'
                    : 'border-[#D7D7D7] bg-white'
                }`}
              >
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
                  {action.icon}
                </View>
                <Text
                  className={`font-cairo-medium text-[16px] leading-[21px] ${
                    action.primary ? 'text-white' : 'text-[#111111]'
                  }`}
                  style={{ writingDirection: 'rtl' }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeBottomSheetView>
    </BottomSheetModal>
  );
});

CompanyActionsSheet.displayName = 'CompanyActionsSheet';

export default CompanyActionsSheet;
