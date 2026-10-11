import { render } from '@testing-library/react-native';

import RequestQuoteAddressField from '@/features/individual/components/request-quote/RequestQuoteAddressField';
import RequestQuoteAttachments from '@/features/individual/components/request-quote/RequestQuoteAttachments';
import RequestQuotePriceRange from '@/features/individual/components/request-quote/RequestQuotePriceRange';
import { QuoteDescriptionField } from '@/shared/components/company/quote-request/QuoteSheetFields';
import RequirementMark from '@/shared/components/ui/RequirementMark';

import AlertAuctionsTab, {
  DEFAULT_ALERT_AUCTIONS_STATE,
} from '../AlertAuctionsTab';
import AlertPropertiesTab, {
  DEFAULT_ALERT_PROPERTIES_STATE,
} from '../AlertPropertiesTab';

jest.mock('@gorhom/bottom-sheet');
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// A label's text includes its nested mark: "المحافظة *", "المنطقة (اختياري)"
const labelOf = (utils: any, label: RegExp) => utils.getByText(label);

describe('RequirementMark', () => {
  it('shows a red * for required, (اختياري) for optional, nothing otherwise', async () => {
    const { Text } = require('react-native');
    const { queryByTestId, rerender } = await render(
      <Text>
        اسم <RequirementMark required />
      </Text>,
    );
    expect(queryByTestId('required-mark')).toBeTruthy();
    expect(queryByTestId('optional-mark')).toBeNull();

    await rerender(
      <Text>
        اسم <RequirementMark optional />
      </Text>,
    );
    expect(queryByTestId('optional-mark')).toBeTruthy();

    await rerender(
      <Text>
        اسم <RequirementMark />
      </Text>,
    );
    expect(queryByTestId('required-mark')).toBeNull();
    expect(queryByTestId('optional-mark')).toBeNull();
  });
});

describe('Add Alert marks the governorate as required and the rest as optional', () => {
  it('real estate (sale)', async () => {
    const utils = await render(
      <AlertPropertiesTab
        value={DEFAULT_ALERT_PROPERTIES_STATE}
        onChange={jest.fn()}
      />,
    );
    expect(labelOf(utils, /^المحافظة \*$/)).toBeTruthy();
    for (const label of [/^المنطقة \(اختياري\)$/, /^فئة العقار \(اختياري\)$/, /^السعر \(اختياري\)$/, /^المساحة \(اختياري\)$/, /^المزايا \(اختياري\)$/]) {
      expect(labelOf(utils, label)).toBeTruthy();
    }
  });

  it('real estate (exchange)', async () => {
    const utils = await render(
      <AlertPropertiesTab
        value={{ ...DEFAULT_ALERT_PROPERTIES_STATE, operationType: 'exchange' }}
        onChange={jest.fn()}
      />,
    );
    for (const label of [/^عدد الغرف \(اختياري\)$/, /^عدد الحمامات \(اختياري\)$/, /^عدد الادوار \(اختياري\)$/, /^سنة الطلب \(اختياري\)$/, /^السنة المطلوبة \(اختياري\)$/]) {
      expect(labelOf(utils, label)).toBeTruthy();
    }
  });

  it('auctions', async () => {
    const utils = await render(
      <AlertAuctionsTab
        value={DEFAULT_ALERT_AUCTIONS_STATE}
        onChange={jest.fn()}
      />,
    );
    expect(labelOf(utils, /^المحافظة \*$/)).toBeTruthy();
    for (const label of [/^المنطقة \(اختياري\)$/, /^فئة العقار \(اختياري\)$/, /^التاريخ من \(اختياري\)$/, /^التاريخ الى \(اختياري\)$/]) {
      expect(labelOf(utils, label)).toBeTruthy();
    }
  });
});

describe('Request a Quote marks its fields', () => {
  it('address and description are required; price range and photos optional', async () => {
    const address = await render(
      <RequestQuoteAddressField addressLabel="" onPress={jest.fn()} />,
    );
    expect(address.getByText(/^العنوان \*$/)).toBeTruthy();

    const description = await render(
      <QuoteDescriptionField value="" onChange={jest.fn()} keyboardAccessoryId="k" />,
    );
    expect(description.getByText(/^وصف \*$/)).toBeTruthy();

    const price = await render(
      <RequestQuotePriceRange
        priceFrom=""
        priceTo=""
        onPriceFromChange={jest.fn()}
        onPriceToChange={jest.fn()}
      />,
    );
    expect(price.getByText(/^نطاق السعر \(اختياري\)$/)).toBeTruthy();

    const photos = await render(
      <RequestQuoteAttachments
        attachments={[]}
        onPickAttachments={jest.fn()}
        onRemoveAttachment={jest.fn()}
      />,
    );
    expect(photos.getByText(/^مرفقات \(اختياري\)$/)).toBeTruthy();
  });
});
