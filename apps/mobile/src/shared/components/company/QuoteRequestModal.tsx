import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetScrollViewMethods,
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
import { useScrollFieldAboveKeyboard } from '@/shared/hooks/useScrollFieldAboveKeyboard';

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

// Stable: a new [] each render would re-create the form's options
const NO_SERVICES: ServiceItem[] = [];

interface QuoteRequestModalProps {
  companyName?: string;
  companySubtitle?: string;
  companyLogoUrl?: string;
  // The company's / office's own services: its request types
  services?: ServiceItem[];
  // The services are still loading (opened from a list)
  servicesLoading?: boolean;
  // A company with no services yet picks from the services catalogue
  catalogFallback?: boolean;
  // The company's «التخصص», shown fixed
  companySpecialty?: string | null;
  onRequestSubmitted?: () => void;
  /**
   * The COMPANY/OFFICE identity this directed quote is sent to. Without it
   * the request would be public — the profile modals always have one.
   */
  targetIdentityId?: string;
}

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
      services = NO_SERVICES,
      servicesLoading = false,
      catalogFallback = false,
      companySpecialty,
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
      catalogFallback,
      companySpecialty,
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

    const scrollRef = useRef<BottomSheetScrollViewMethods>(null);
    const descriptionField = useScrollFieldAboveKeyboard(scrollRef);

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
        // 90% only, below the status bar: dynamic sizing added a snap point
        // at the content's full height and over-drag went past it, so the
        // sheet could be dragged under the clock (as the ad preview, QA)
        enableDynamicSizing={false}
        enableOverDrag={false}
        topInset={insets.top}
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
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            // Room for the pinned footer, so the last field can scroll
            // above it, and for the keyboard while it is up, so «وصف» can
            // scroll above both (the sheet itself doesn't shrink)
            paddingBottom: 120 + descriptionField.keyboardSpace,
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

          {form.fixedSpecialty ? (
            // The company's own «التخصص»: shown, not picked
            <InlineDropdown
              title="مجال التخصص"
              placeholder={form.fixedSpecialty}
              options={form.specialtyOptions}
              value={form.fixedSpecialty}
              onChange={form.setSpecialtyId}
              disabled
              testID="quote-specialty"
            />
          ) : (
            form.usesCatalog &&
            !servicesLoading && (
              // No services nor specialty yet: the catalogue, as طلب عرض سعر
              <InlineDropdown
                title="مجال التخصص"
                required
                placeholder="اختر مجال التخصص"
                options={form.specialtyOptions}
                value={form.specialtyId}
                onChange={form.setSpecialtyId}
                testID="quote-specialty"
              />
            )
          )}

          <InlineDropdown
            title="نوع الطلب"
            required={!form.usesCatalog}
            optional={form.usesCatalog}
            placeholder={
              servicesLoading
                ? 'جاري تحميل خدمات الشركة...'
                : form.usesCatalog && !form.specialtyId
                  ? 'اختر مجال التخصص أولاً'
                  : 'حدد الخدمة التي ترغب بها'
            }
            options={form.serviceOptions}
            value={form.serviceId}
            onChange={form.setServiceId}
            disabled={
              servicesLoading || (form.usesCatalog && !form.specialtyId)
            }
            testID="quote-service"
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
            // The sheet rose but its content didn't scroll: «وصف» stayed
            // under «إرسال الطلب» while typing (QA)
            onLayout={descriptionField.onLayout}
            onFocus={descriptionField.onFocus}
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
