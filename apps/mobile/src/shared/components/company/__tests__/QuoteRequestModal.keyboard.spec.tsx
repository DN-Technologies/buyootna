import { fireEvent, render } from '@testing-library/react-native';
import { Keyboard } from 'react-native';

import QuoteRequestModal from '../QuoteRequestModal';

// QA (screenshot): in a company's «تقديم طلب سعر» sheet the keyboard rose
// over «وصف», which stayed under «إرسال الطلب»
jest.mock('@/shared/components/forms/GovAreaFields', () => () => null);
jest.mock('../quote-request/useQuoteRequestForm', () => ({
  useQuoteRequestForm: () => ({
    fixedSpecialty: null,
    usesCatalog: false,
    specialtyOptions: [],
    specialtyId: null,
    setSpecialtyId: jest.fn(),
    serviceOptions: [],
    serviceId: null,
    setServiceId: jest.fn(),
    priceFrom: '',
    setPriceFrom: jest.fn(),
    priceTo: '',
    setPriceTo: jest.fn(),
    govArea: {},
    description: '',
    setDescription: jest.fn(),
    attachments: [],
    pickAttachments: jest.fn(),
    removeAttachment: jest.fn(),
    isSubmitting: false,
    submit: jest.fn(),
    reset: jest.fn(),
  }),
}));

it('focusing «وصف» waits for the keyboard to scroll it into view', async () => {
  const addListener = jest
    .spyOn(Keyboard, 'addListener')
    .mockReturnValue({ remove: jest.fn() } as never);
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);

  const { getByTestId } = await render(<QuoteRequestModal companyName="شركة" />);
  addListener.mockClear();
  await fireEvent(getByTestId('quote-description'), 'focus');

  expect(addListener).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));
});
