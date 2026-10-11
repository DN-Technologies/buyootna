import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequestCloseIcon } from '@/assets/icons/activity';
import type { RequestOffer } from '@/features/company/components/requests/types';
import { ReplyBlocks } from '@/features/individual/components/request-details/ProviderReplyCard';
import ProviderSummary from '@/features/individual/components/request-details/ProviderSummary';

interface ReplyDetailsSheetProps {
  offer?: RequestOffer;
  onClose: () => void;
  onChatPress: (offer: RequestOffer) => void;
  onAccept: (offer: RequestOffer) => void;
  onReject: (offer: RequestOffer) => void;
}

/** "تفاصيل رد شركة …": one company's reply with رفض / قبول العرض. */
const ReplyDetailsSheet = forwardRef<BottomSheetModal, ReplyDetailsSheetProps>(
  ({ offer, onClose, onChatPress, onAccept, onReject }, ref) => {
    const insets = useSafeAreaInsets();
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
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#000000', width: 45, height: 5 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
        onDismiss={onClose}
      >
        <BottomSheetView>
          {offer && (
            <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
              <View className="flex-row items-center justify-between py-[6px] pe-4 ps-[10px]">
                <Text
                  testID="reply-sheet-title"
                  className="flex-1 font-cairo-semibold text-[18px] leading-[26px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  تفاصيل رد {offer.provider.name}
                </Text>
                <TouchableOpacity
                  testID="reply-sheet-close"
                  accessibilityLabel="إغلاق"
                  activeOpacity={0.7}
                  onPress={() => (ref as any)?.current?.dismiss()}
                  className="h-8 w-8 items-center justify-center rounded-[64px]"
                >
                  <RequestCloseIcon />
                </TouchableOpacity>
              </View>

              <View className="mt-3 gap-4 px-4 pt-4">
                <View className="p-[14px]">
                  <ProviderSummary
                    provider={offer.provider}
                    onChatPress={() => onChatPress(offer)}
                  />
                </View>
                {offer.reply && <ReplyBlocks reply={offer.reply} />}
              </View>

              <View className="flex-row items-center gap-2 px-4 pb-6 pt-4">
                <TouchableOpacity
                  testID="reply-sheet-accept"
                  activeOpacity={0.8}
                  onPress={() => onAccept(offer)}
                  className="h-12 flex-1 items-center justify-center rounded-[24px] bg-[#15304D] px-5"
                >
                  <Text
                    className="font-cairo-semibold text-[14px] leading-[21px] text-white"
                    style={{ letterSpacing: 0.28 }}
                  >
                    قبول العرض
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="reply-sheet-reject"
                  activeOpacity={0.8}
                  onPress={() => onReject(offer)}
                  className="h-12 flex-1 items-center justify-center rounded-[24px] border border-[#9C1E28] px-5"
                >
                  <Text
                    className="font-cairo-semibold text-[14px] leading-[21px] text-[#9C1E28]"
                    style={{ letterSpacing: 0.28 }}
                  >
                    رفض
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
ReplyDetailsSheet.displayName = 'ReplyDetailsSheet';

export default ReplyDetailsSheet;
