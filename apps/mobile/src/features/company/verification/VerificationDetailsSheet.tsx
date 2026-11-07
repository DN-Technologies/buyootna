import { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Text, View } from 'react-native';

import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

import { formatSubmittedAt } from './format';
import { CategoryIcon, ClockSmallIcon, CollectionsIcon } from './icons';
import type { VerificationRequest } from './verification.service';
import {
  LicenseFileRow,
  Notice,
  renderSheetBackdrop,
  SHEET_BACKGROUND,
  SHEET_HANDLE,
  SheetHeader,
} from './VerificationParts';

/** A labelled value with its icon in a yellow dot on the right. */
function Detail({
  icon,
  label,
  children,
  grow = true,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  grow?: boolean;
}) {
  return (
    <View
      className={`flex-row items-start gap-1.5 ${grow ? 'flex-1' : 'w-full'}`}
    >
      <View className="h-6 w-6 items-center justify-center rounded-full bg-[#FBEFCD]">
        {icon}
      </View>
      <View className="flex-1 items-start gap-1.5">
        <Text
          className="font-cairo-semibold text-[13px] leading-[16px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {label}
        </Text>
        {children}
      </View>
    </View>
  );
}

function Value({ children }: { children: ReactNode }) {
  return (
    <Text
      className="font-cairo-semibold text-[13px] leading-[16px] text-[#111111]"
      style={{ writingDirection: 'rtl' }}
    >
      {children}
    </Text>
  );
}

interface Props {
  request: VerificationRequest | null;
}

/** «تفاصيل طلب التوثيق» while it's under review (Figma 10307:141541). */
const VerificationDetailsSheet = forwardRef<BottomSheetModal, Props>(
  ({ request }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    useImperativeHandle(ref, () => sheetRef.current as BottomSheetModal);

    return (
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        backdropComponent={renderSheetBackdrop}
        handleIndicatorStyle={SHEET_HANDLE}
        backgroundStyle={SHEET_BACKGROUND}
      >
        <SafeBottomSheetView className="gap-4 px-4 pb-4">
          <SheetHeader
            title="تفاصيل طلب التوثيق"
            onClose={() => sheetRef.current?.dismiss()}
          />

          {request ? (
            <View className="w-full gap-4">
              <View className="w-full gap-2">
                <Text
                  className="w-full font-cairo-bold text-[14px] leading-[18px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {formatSubmittedAt(request.submittedAt)}
                </Text>
                <Notice variant="info">
                  تم استلام بياناتك بنجاح. جاري مراجعة المستندات، وسيتم إبلاغك
                  بالنتيجة خلال24ساعة.
                </Notice>
              </View>

              <View className="w-full gap-6 rounded-[8px] border-[0.5px] border-[#ECECEC] bg-[#F8F8F8] p-3.5">
                <View className="w-full flex-row items-center gap-6">
                  <Detail
                    icon={
                      <Text className="font-cairo-bold text-[9px] text-[#15304D]">
                        #01
                      </Text>
                    }
                    label="رقم الرخصة"
                  >
                    <Value>{request.licenseNumber}</Value>
                  </Detail>
                  <Detail
                    icon={<ClockSmallIcon width={14} height={14} />}
                    label="تاريخ انتهاء"
                  >
                    <Value>{request.licenseExpiry || '—'}</Value>
                  </Detail>
                </View>

                <Detail
                  grow={false}
                  icon={<CategoryIcon width={10.13} height={10.13} />}
                  label="النشاط"
                >
                  <Value>{request.licenseActivity || '—'}</Value>
                </Detail>

                <Detail
                  grow={false}
                  icon={<CollectionsIcon width={14} height={14} />}
                  label="الصور"
                >
                  <LicenseFileRow
                    url={request.licenseFileUrl}
                    name={request.licenseFileName}
                    size={request.licenseFileSize}
                    mimeType={request.licenseFileType}
                    date={request.submittedAt}
                    received
                  />
                </Detail>
              </View>
            </View>
          ) : null}
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

VerificationDetailsSheet.displayName = 'VerificationDetailsSheet';

export default VerificationDetailsSheet;
