import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { companyService } from '@/shared/api/company.service';
import { listedTypes } from '@/shared/data/serviceCatalog';

import AddServiceScreen from '../AddServiceScreen';

const mockPresent = jest.fn();
let mockSpecialty: string | null = null;
// What the company already offers (GET /users/profile/services)
let mockMyServices: {
  specialty: string | null;
  services: { id: string; type: string; title: string | null }[];
  isLoading: boolean;
} = { specialty: null, services: [], isLoading: false };

const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockCanGoBack = true;
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: mockBack,
    replace: mockReplace,
    canGoBack: () => mockCanGoBack,
  }),
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

jest.mock('@/features/company/hooks/useMyCompanyServices', () => ({
  useMyCompanyServices: () => mockMyServices,
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
    mockMyServices = { specialty: null, services: [], isLoading: false };
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

  it('offers the 33 specialties of the services catalogue and the engineering checklist', async () => {
    const { getByTestId, getAllByTestId } = await render(<AddServiceScreen />);

    await fireEvent.press(getByTestId('service-specialty'));
    expect(getAllByTestId(/^service-specialty-(?!value|options)/)).toHaveLength(
      33,
    );
    await fireEvent.press(getByTestId('service-specialty-مكتب هندسي'));
    expect(getByTestId('service-specialty-value').props.children).toBe(
      'مكتب هندسي',
    );

    await fireEvent.press(getByTestId('service-types'));
    // الكل + 29 listed types + اخرى
    expect(getAllByTestId(/^service-type-/)).toHaveLength(31);
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
    expect(sent.types).toHaveLength(29);
    expect(sent.types).not.toContain('الكل');
    expect(sent.title).toBeUndefined();
    // QA: saved, then straight back to الخدمات (no sheet left on the form)
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
    expect(mockPresent).not.toHaveBeenCalled();
  });

  it('opened with nothing to go back to, it lands on الخدمات', async () => {
    mockCanGoBack = false;
    const { getByTestId, getByText } = await render(<AddServiceScreen />);

    await fireEvent.press(getByTestId('service-specialty'));
    await fireEvent.press(getByTestId('service-specialty-مكتب هندسي'));
    await fireEvent.press(getByTestId('service-types'));
    await fireEvent.press(getByTestId('service-type-الكل'));
    await fireEvent.press(getByText('إضافة الخدمة'));

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/company-services'),
    );
    expect(mockBack).not.toHaveBeenCalled();
    mockCanGoBack = true;
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

  it('every specialty has its own list from the catalogue: المسابح', async () => {
    const { getByTestId, getAllByTestId, getByText } = await render(
      <AddServiceScreen />,
    );

    await fireEvent.press(getByTestId('service-specialty'));
    await fireEvent.press(getByTestId('service-specialty-المسابح'));
    await fireEvent.press(getByTestId('service-types'));
    // الكل + 5 listed types + اخرى
    expect(getAllByTestId(/^service-type-/)).toHaveLength(7);

    await fireEvent.press(getByTestId('service-type-الكل'));
    await fireEvent.press(getByText('إضافة الخدمة'));
    await waitFor(() =>
      expect(createService).toHaveBeenCalledWith(
        expect.objectContaining({
          specialty: 'المسابح',
          types: listedTypes('المسابح'),
        }),
      ),
    );
  });

  describe('the second time (Figma 8455:24216, 8453:24047)', () => {
    const ENGINEERING = listedTypes('مكتب هندسي');
    const added = (types: string[]) =>
      types.map((type, i) => ({ id: `s${i}`, type, title: null }));

    it("locks التخصص from the company's services, even before the profile refreshes", async () => {
      mockMyServices = {
        specialty: 'مكتب هندسي',
        services: added(ENGINEERING.slice(0, 3)),
        isLoading: false,
      };
      const { getByTestId, queryByTestId } = await render(<AddServiceScreen />);

      expect(getByTestId('service-specialty-value').props.children).toBe(
        'مكتب هندسي',
      );
      await fireEvent.press(getByTestId('service-specialty'));
      expect(queryByTestId('service-specialty-options')).toBeNull();
    });

    it('shows the types already added ticked and greyed, and they never send again', async () => {
      mockMyServices = {
        specialty: 'مكتب هندسي',
        services: added(ENGINEERING.slice(0, 3)),
        isLoading: false,
      };
      const { getByTestId, getByText } = await render(<AddServiceScreen />);
      await fireEvent.press(getByTestId('service-types'));

      for (const type of ENGINEERING.slice(0, 3)) {
        const row = getByTestId(`service-type-${type}`);
        expect(row.props.accessibilityState).toEqual({
          checked: true,
          disabled: true,
        });
      }
      expect(isDisabled(getByTestId('service-type-الكل'))).toBe(false);

      // Pressing a taken row picks nothing: the field still shows its
      // placeholder
      await fireEvent.press(getByTestId(`service-type-${ENGINEERING[0]}`));
      expect(getByTestId('service-types-value').props.children).toBe(
        'اختر نوع الخدمة',
      );

      // الكل picks only the ten still free
      await fireEvent.press(getByTestId('service-type-الكل'));
      await fireEvent.press(getByText('إضافة الخدمة'));
      await waitFor(() =>
        expect(createService).toHaveBeenCalledWith(
          expect.objectContaining({
            specialty: 'مكتب هندسي',
            types: ENGINEERING.slice(3),
          }),
        ),
      );
    });

    it('with every type added, الكل is greyed and اخرى with a title still adds', async () => {
      mockMyServices = {
        specialty: 'مكتب هندسي',
        services: [
          ...added(ENGINEERING),
          { id: 'o1', type: 'اخرى', title: 'إشراف هندسي' },
        ],
        isLoading: false,
      };
      const { getByTestId, getByText } = await render(<AddServiceScreen />);
      await fireEvent.press(getByTestId('service-types'));

      expect(isDisabled(getByTestId('service-type-الكل'))).toBe(true);
      // An earlier "اخرى" doesn't take "اخرى" away
      expect(isDisabled(getByTestId('service-type-اخرى'))).toBe(false);

      await fireEvent.press(getByTestId('service-type-اخرى'));
      await fireEvent.changeText(getByTestId('service-title'), 'تصميم مسابح');
      await fireEvent.press(getByText('إضافة الخدمة'));
      await waitFor(() =>
        expect(createService).toHaveBeenCalledWith(
          expect.objectContaining({ types: ['اخرى'], title: 'تصميم مسابح' }),
        ),
      );
    });

    it("doesn't open نوع الخدمة until the company's services are known", async () => {
      mockMyServices = { specialty: 'مكتب هندسي', services: [], isLoading: true };
      const { getByTestId, queryByTestId } = await render(<AddServiceScreen />);

      await fireEvent.press(getByTestId('service-types'));
      expect(queryByTestId('service-type-الكل')).toBeNull();
    });
  });
});
