import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { companyService } from '@/shared/api/company.service';

import AddServiceScreen from '../AddServiceScreen';

const mockPresent = jest.fn();
let mockSpecialty: string | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const React = require('react');
  const BottomSheetModal = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      present: mockPresent,
      dismiss: jest.fn(),
    }));
    return <View>{props.children}</View>;
  });
  BottomSheetModal.displayName = 'BottomSheetModal';
  return {
    __esModule: true,
    BottomSheetModal,
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock('expo-image', () => ({ Image: 'Image' }));

jest.mock('@/shared/api/company.service', () => ({
  companyService: { createService: jest.fn() },
}));

jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({
    activeIdentity: { id: 'co-1', companyData: { specialty: mockSpecialty } },
  }),
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ refreshProfile: jest.fn() }),
}));

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const createService = companyService.createService as jest.Mock;
const isDisabled = (node: { props: Record<string, any> }) =>
  node.props.accessibilityState?.disabled === true;

describe('AddServiceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSpecialty = null;
    createService.mockResolvedValue({ success: true, created: 1 });
  });

  it('starts with التخصص, نوع الخدمة and الوصف, and a disabled button', async () => {
    const { getByText, getByTestId, queryByTestId } = await render(
      <AddServiceScreen />,
    );

    expect(getByText('إضافة خدمة')).toBeTruthy();
    expect(getByTestId('service-specialty-value').props.children).toBe(
      'اختر التخصص',
    );
    expect(getByTestId('service-types-value').props.children).toBe(
      'اختر نوع الخدمة',
    );
    expect(getByText('يجب أن لا يتخطى الوصف 100 حرف.')).toBeTruthy();
    // عنوان الخدمة only comes with "اخرى"
    expect(queryByTestId('service-title')).toBeNull();
    expect(isDisabled(getByTestId('company-submit'))).toBe(true);
  });

  it('offers the 32 specialties and the engineering checklist', async () => {
    const { getByTestId, getAllByTestId } = await render(<AddServiceScreen />);

    await fireEvent.press(getByTestId('service-specialty'));
    expect(getAllByTestId(/^service-specialty-(?!value|options)/)).toHaveLength(
      32,
    );
    await fireEvent.press(getByTestId('service-specialty-مكتب هندسي'));
    expect(getByTestId('service-specialty-value').props.children).toBe(
      'مكتب هندسي',
    );

    await fireEvent.press(getByTestId('service-types'));
    // الكل + 13 listed types + اخرى
    expect(getAllByTestId(/^service-type-/)).toHaveLength(15);
  });

  it('"الكل" ticks every listed type and sends them', async () => {
    const { getByTestId, getByText } = await render(<AddServiceScreen />);

    await fireEvent.press(getByTestId('service-specialty'));
    await fireEvent.press(getByTestId('service-specialty-مكتب هندسي'));
    await fireEvent.press(getByTestId('service-types'));
    await fireEvent.press(getByTestId('service-type-الكل'));
    expect(getByTestId('service-types-value').props.children).toBe('الكل');

    await fireEvent.press(getByText('إضافة الخدمة'));
    await waitFor(() => expect(createService).toHaveBeenCalled());
    const sent = createService.mock.calls[0][0];
    expect(sent.specialty).toBe('مكتب هندسي');
    expect(sent.types).toHaveLength(13);
    expect(sent.types).not.toContain('الكل');
    expect(sent.title).toBeUndefined();
    expect(mockPresent).toHaveBeenCalled();
  });

  it('"اخرى" asks for a title before the button enables', async () => {
    const { getByTestId, getByText } = await render(<AddServiceScreen />);

    await fireEvent.press(getByTestId('service-specialty'));
    await fireEvent.press(getByTestId('service-specialty-التكييف'));
    await fireEvent.press(getByTestId('service-types'));
    await fireEvent.press(getByTestId('service-type-اخرى'));

    const button = () => getByTestId('company-submit');
    expect(isDisabled(button())).toBe(true);
    await fireEvent.changeText(getByTestId('service-title'), 'صيانة سبليت');
    expect(isDisabled(button())).toBe(false);

    await fireEvent.press(getByText('إضافة الخدمة'));
    await waitFor(() =>
      expect(createService).toHaveBeenCalledWith({
        specialty: 'التكييف',
        types: ['اخرى'],
        title: 'صيانة سبليت',
        description: undefined,
      }),
    );
  });

  it('a specialty without a list offers الكل and اخرى; الكل sends the specialty', async () => {
    const { getByTestId, getAllByTestId, getByText } = await render(
      <AddServiceScreen />,
    );

    await fireEvent.press(getByTestId('service-specialty'));
    await fireEvent.press(getByTestId('service-specialty-المسابح'));
    await fireEvent.press(getByTestId('service-types'));
    expect(getAllByTestId(/^service-type-/)).toHaveLength(2);

    await fireEvent.press(getByTestId('service-type-الكل'));
    await fireEvent.press(getByText('إضافة الخدمة'));
    await waitFor(() =>
      expect(createService).toHaveBeenCalledWith(
        expect.objectContaining({ specialty: 'المسابح', types: ['المسابح'] }),
      ),
    );
  });

  it('locks التخصص once the company has one', async () => {
    mockSpecialty = 'مكتب هندسي';
    const { getByTestId, queryByTestId } = await render(<AddServiceScreen />);

    expect(getByTestId('service-specialty-value').props.children).toBe(
      'مكتب هندسي',
    );
    await fireEvent.press(getByTestId('service-specialty'));
    expect(queryByTestId('service-specialty-options')).toBeNull();
  });
});
