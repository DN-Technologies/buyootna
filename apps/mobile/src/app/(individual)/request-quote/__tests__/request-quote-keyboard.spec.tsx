import { fireEvent, render } from '@testing-library/react-native';
import { Keyboard } from 'react-native';

import RequestQuoteScreen from '../index';

// QA: the keyboard covered «وصف» while typing in «طلب عرض سعر»
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), push: jest.fn() }),
}));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (sel: (s: object) => unknown) => sel({ activeIdentity: null }),
}));
jest.mock('@/shared/components/forms/GovAreaFields', () => () => null);
jest.mock('@/features/individual/hooks/useRequestQuoteForm', () => ({
  SPECIALTY_OPTIONS: [],
  useRequestQuoteForm: () => ({
    specialtyId: null,
    setSpecialtyId: jest.fn(),
    requestTypeId: null,
    setRequestTypeId: jest.fn(),
    requestTypeOptions: [],
    priceFrom: '',
    setPriceFrom: jest.fn(),
    priceTo: '',
    setPriceTo: jest.fn(),
    govArea: {},
    description: '',
    setDescription: jest.fn(),
    attachments: [],
    isSubmitting: false,
    handlePickAttachments: jest.fn(),
    removeAttachment: jest.fn(),
    handleSubmit: jest.fn(),
  }),
}));

it('focusing «وصف» waits for the keyboard to scroll it into view', async () => {
  const addListener = jest
    .spyOn(Keyboard, 'addListener')
    .mockReturnValue({ remove: jest.fn() } as never);
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);

  const { getByTestId } = await render(<RequestQuoteScreen />);
  await fireEvent(getByTestId('request-quote-description'), 'focus');

  expect(addListener).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));
});
