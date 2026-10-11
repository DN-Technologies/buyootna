import { act, fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import OfficeAdPreviewScreen from '../preview';

const mockHandleSubmit = jest.fn();
const mockHandleSaveDraft = jest.fn();
const mockHandleSlotSelected = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useRouter: () => jest.requireMock('expo-router').router,
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('@/shared/hooks/properties/useSubmitListing', () => ({
  useSubmitListing: () => ({
    draftData: {
      listingType: 'sell',
      governorate: { id: '1', label: 'حولي' },
      area: { id: '2', label: 'السالمية' },
      propertyCategory: { id: 'apartment', label: 'شقة' },
      areaSize: '500',
      price: '1,500',
      showPrice: true,
      rooms: 4,
      baths: 4,
      floors: 2,
      features: ['بطن وظهر'],
      adDetails: 'شقة للبيع بموقع مميز',
      phoneNumber: '58094586',
      adLevel: 'normal',
      images: ['https://example.com/img1.jpg'],
    },
    isSubmitting: false,
    slotPickerRef: { current: null },
    quotaSheetRef: { current: null },
    publishOptions: [],
    quotaSheetMode: 'exhausted',
    showSuccess: false,
    setShowSuccess: jest.fn(),
    createdPropertyId: null,
    handleSubmit: mockHandleSubmit,
    handleSlotSelected: mockHandleSlotSelected,
    handleSaveDraft: mockHandleSaveDraft,
  }),
}));

describe('OfficeAdPreviewScreen (Figma 4494:142685 & 4494:142831)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders preview screen with title, subtitle, and draft details', async () => {
    const { getByText, getByTestId } = await render(<OfficeAdPreviewScreen />);

    expect(getByText('معاينة الاعلان')).toBeTruthy();
    expect(
      getByText('هذه معاينة لكيف سيظهر إعلانك للمستخدمين'),
    ).toBeTruthy();
    expect(getByTestId('preview-back-button')).toBeTruthy();
    expect(getByTestId('preview-footer-actions')).toBeTruthy();
    expect(getByText('بيع')).toBeTruthy();
    expect(getByText('شقة')).toBeTruthy();
    expect(getByText('500 م²')).toBeTruthy();
    expect(getByText('1,500 د.ك')).toBeTruthy();
    expect(getByText('بطن وظهر')).toBeTruthy();
  });

  it('handles back button navigation', async () => {
    const { getByTestId } = await render(<OfficeAdPreviewScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('preview-back-button'));
    });

    expect(router.back).toHaveBeenCalled();
  });

  it('calls handleSaveDraft when "حفظ كمسودة" button is pressed', async () => {
    const { getByTestId } = await render(<OfficeAdPreviewScreen />);

    const draftBtn = getByTestId('button-save-draft');
    await act(async () => {
      fireEvent.press(draftBtn);
    });

    expect(mockHandleSaveDraft).toHaveBeenCalled();
  });

  it('calls handleSubmit when "إضافة الاعلان" button is pressed', async () => {
    const { getByTestId } = await render(<OfficeAdPreviewScreen />);

    const publishBtn = getByTestId('button-confirm-publish');
    await act(async () => {
      fireEvent.press(publishBtn);
    });

    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
