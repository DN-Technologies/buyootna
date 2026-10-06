import { Feather } from '@expo/vector-icons';
import {
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import SheetBackdrop from './SheetBackdrop';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

interface DeleteInvoiceSheetProps {
  onConfirm: () => void;
  isDeleting: boolean;
}

// حذف فاتورة الخدمة ؟ -- removes it from the client's own record only
const DeleteInvoiceSheet = forwardRef<BottomSheetModal, DeleteInvoiceSheetProps>(
  ({ onConfirm, isDeleting }, ref) => {
    const dismiss = useCallback(() => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    }, [ref]);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        backdropComponent={SheetBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#111111', width: 44 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <SafeBottomSheetView className="items-center px-6 pb-8 pt-3">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FFEBEB]">
            <Feather name="trash-2" size={26} color="#9C1E28" />
          </View>
          <Text className="mt-3 text-center font-cairo-bold text-[17px] text-[#111111]">
            حذف فاتورة الخدمة ؟
          </Text>
          <Text
            className="mt-1.5 px-2 text-center font-cairo text-[13px] leading-5 text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            هل أنت متأكد من حذف فاتورة الخدمة هذه؟ سيتم حذف الفاتورة من سجلك، ولا
            يمكن التراجع عن هذا الإجراء.
          </Text>
          <View className="mt-5 w-full gap-3">
            <TouchableOpacity
              testID="delete-invoice-confirm"
              activeOpacity={0.8}
              disabled={isDeleting}
              onPress={onConfirm}
              className="h-12 w-full items-center justify-center rounded-full bg-[#9C1E28]"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="font-cairo-semibold text-sm text-white">
                  حذف الفاتورة
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              testID="delete-invoice-cancel"
              activeOpacity={0.8}
              onPress={dismiss}
              className="h-12 w-full items-center justify-center rounded-full border border-[#E2E8F0] bg-white"
            >
              <Text className="font-cairo-semibold text-sm text-[#111111]">
                تراجع
              </Text>
            </TouchableOpacity>
          </View>
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

DeleteInvoiceSheet.displayName = 'DeleteInvoiceSheet';

export default DeleteInvoiceSheet;
