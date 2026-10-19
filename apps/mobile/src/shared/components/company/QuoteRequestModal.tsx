import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RequestQuoteAttachments from '@/features/individual/components/request-quote/RequestQuoteAttachments';
import InlineDropdown from '@/shared/components/filters/InlineDropdown';
import GovAreaFields from '@/shared/components/forms/GovAreaFields';

import KeyboardDoneBar from './quote-request/KeyboardDoneBar';
import QuoteCompanyCard from './quote-request/QuoteCompanyCard';
import QuoteRequestHeader from './quote-request/QuoteRequestHeader';
import {
  QuoteDescriptionField,
  QuotePriceRangeFields,
} from './quote-request/QuoteSheetFields';
import QuoteSubmitFooter from './quote-request/QuoteSubmitFooter';
import {
  type ServiceItem,
  useQuoteRequestForm,
} from './quote-request/useQuoteRequestForm';

interface QuoteRequestModalProps {
  companyName?: string;
  companySubtitle?: string;
  companyLogoUrl?: string;
  services?: ServiceItem[];
  onRequestSubmitted?: () => void;
  /**
   * The COMPANY/OFFICE identity this directed quote is sent to. Without it
   * the request would be public — the profile modals always have one.
   */
  targetIdentityId?: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: '1', title: 'الأثاث' },
  { id: '2', title: 'شبكات نت' },
  { id: '3', title: 'ديكورات وتصميم' },
];

/**
 * تقديم طلب سعر sent straight to one company or office: the form lives in
 * useQuoteRequestForm, the pieces in ./quote-request and the request-quote
 * screen (attachments are shared with it).
 */
const QuoteRequestModal = forwardRef<BottomSheetModal, QuoteRequestModalProps>(
  (
    {
      companyName = 'الشركة',
      companySubtitle,
      companyLogoUrl,
      services = DEFAULT_SERVICES,
      onRequestSubmitted,
      targetIdentityId,
    },
    ref,
  ) => {
    const internalRef = useRef<BottomSheetModal>(null);
    useImperativeHandle(ref, () => internalRef.current as BottomSheetModal);
    const keyboardAccessoryId = useId();
    const insets = useSafeAreaInsets();

    const form = useQuoteRequestForm({
      companyName,
      services,
      targetIdentityId,
      onSent: () => {
        internalRef.current?.dismiss();
        onRequestSubmitted?.();
      },
    });

    // Dimmed backdrop like the app's other sheets: without it the sheet
    // read as a full screen page instead of a bottom sheet (QA)
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const renderFooter = (props: BottomSheetFooterProps) => (
      <QuoteSubmitFooter
        {...props}
        bottomInset={insets.bottom}
        isSubmitting={form.isSubmitting}
        onSubmit={form.submit}
      />
    );

    return (
      <BottomSheetModal
        ref={internalRef}
        snapPoints={['90%']}
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 24 }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        // No android_keyboardInputMode="adjustResize": with edge-to-edge the
        // window never resizes, and in that mode the sheet doesn't move either,
        // so the keyboard covered it. The default lets the sheet rise itself.
        onDismiss={form.reset}
      >
        <QuoteRequestHeader onClose={() => internalRef.current?.dismiss()} />

        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            // Room for the pinned footer, so the last field can scroll
            // above it
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <QuoteCompanyCard
            name={companyName}
            subtitle={companySubtitle}
            logoUrl={companyLogoUrl}
          />

          <InlineDropdown
            title="نوع الطلب"
            required
            placeholder="حدد الخدمة التي ترغب بها"
            options={form.serviceOptions}
            value={form.serviceId}
            onChange={form.setServiceId}
          />

          <QuotePriceRangeFields
            priceFrom={form.priceFrom}
            priceTo={form.priceTo}
            onPriceFromChange={form.setPriceFrom}
            onPriceToChange={form.setPriceTo}
            keyboardAccessoryId={keyboardAccessoryId}
          />

          <GovAreaFields value={form.govArea} />

          <QuoteDescriptionField
            value={form.description}
            onChange={form.setDescription}
            keyboardAccessoryId={keyboardAccessoryId}
          />

          <RequestQuoteAttachments
            attachments={form.attachments}
            onPickAttachments={form.pickAttachments}
            onRemoveAttachment={form.removeAttachment}
          />
        </BottomSheetScrollView>

        <KeyboardDoneBar nativeID={keyboardAccessoryId} />

      </BottomSheetModal>
    );
  },
);

QuoteRequestModal.displayName = 'QuoteRequestModal';

export default QuoteRequestModal;
