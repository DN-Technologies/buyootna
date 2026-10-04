import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import ClientRequestPicker from './ClientRequestPicker';

interface ClientPickerSheetProps {
  selectedRequestId: string | null;
  onSelect: (client: import('@/shared/api/serviceInvoices.service').InvoiceableClient | null) => void;
}

/**
 * اختيار العميل: the accepted-requests list inside a bottom sheet, opened
 * from the "ابحث عن عميل..." pill on the invoice's general-data step.
 * Picking the selected client again clears it (back to typing a name).
 */
const ClientPickerSheet = forwardRef<BottomSheetModal, ClientPickerSheetProps>(
  ({ selectedRequestId, onSelect }, ref) => {
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

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        enableDynamicSizing={true}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
          backgroundColor: '#111111',
          width: 40,
          height: 4,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView>
          <View className="bg-white px-4 pb-8 pt-1">
            <View className="flex-row items-center justify-between pb-4">
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  ref.current?.dismiss();
                }}
                className="p-2"
              >
                <Ionicons name="close" size={20} color="#111111" />
              </TouchableOpacity>
              <Text
                className="font-cairo-semibold text-[18px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                اختيار العميل
              </Text>
            </View>

            <ClientRequestPicker
              selectedRequestId={selectedRequestId}
              onSelect={(client) => {
                onSelect(client);
                // @ts-ignore
                ref.current?.dismiss();
              }}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

ClientPickerSheet.displayName = 'ClientPickerSheet';

export default ClientPickerSheet;
