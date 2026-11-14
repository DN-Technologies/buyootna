import { render } from '@testing-library/react-native';

import RequestQuotePriceRange from '@/features/individual/components/request-quote/RequestQuotePriceRange';
import { QuotePriceRangeFields } from '@/shared/components/company/quote-request/QuoteSheetFields';

// QA: «الى» sat on the right of «نطاق السعر». The app lays rows out right
// to left, so the first field is the right one: it must be «من»
// In the order they're laid out (the first is the right-hand one)
type View = Awaited<ReturnType<typeof render>>;
const placeholders = (view: View) =>
  view
    .getAllByPlaceholderText(/^(من|الى)$/)
    .map((node) => node.props.placeholder as string);

const props = {
  priceFrom: '',
  priceTo: '',
  onPriceFromChange: jest.fn(),
  onPriceToChange: jest.fn(),
  keyboardAccessoryId: 'kb',
};

describe('«نطاق السعر» reads «من … الى» from the right', () => {
  it('in «+» › طلب عرض سعر', async () => {
    const view = await render(<RequestQuotePriceRange {...props} />);
    expect(placeholders(view)).toEqual(['من', 'الى']);
  });

  it("in a company's «تقديم طلب سعر» sheet", async () => {
    const view = await render(<QuotePriceRangeFields {...props} />);
    expect(placeholders(view)).toEqual(['من', 'الى']);
  });
});
