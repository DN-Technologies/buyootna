import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { companyService } from '@/shared/api/company.service';

import { servicesSummary } from '../services.utils';
import ServicesScreen from '../ServicesScreen';
import { useServicesToast } from '../useServicesToast';

jest.mock('@/shared/api/company.service', () => ({
  companyService: {
    getMyServices: jest.fn(),
    setServiceHidden: jest.fn(),
    updateServices: jest.fn(),
    deleteAllServices: jest.fn(),
    deleteService: jest.fn(),
    createService: jest.fn(),
  },
}));
const mockRefreshProfile = jest.fn();
jest.mock('@/shared/store/useAuthStore', () => {
  const state = { token: 'token', refreshProfile: () => mockRefreshProfile() };
  const useAuthStore = (selector?: (s: typeof state) => unknown) =>
    selector ? selector(state) : state;
  return { useAuthStore };
});
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const api = companyService as jest.Mocked<typeof companyService>;

const data = {
  specialty: 'مكتب هندسي',
  servicesHidden: false,
  description: 'تنفيذ مشاريع البناء',
  createdAt: '2025-05-19T10:00:00.000Z',
  services: [
    { id: 's1', type: 'مخطط معماري (المساقط)', title: null, isHidden: false },
    { id: 's2', type: 'مخططات تنفيذية', title: null, isHidden: true },
  ],
};

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ServicesScreen />
    </QueryClientProvider>,
  );
}

describe('الخدمات', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useServicesToast.setState({ toast: null });
    api.getMyServices.mockResolvedValue(data);
    api.setServiceHidden.mockResolvedValue({ success: true });
    api.updateServices.mockResolvedValue(data);
    api.deleteAllServices.mockResolvedValue({ success: true, deleted: 2 });
  });

  it('shows the specialty, the card text and the sub-services with their switches', async () => {
    const { findByText, getByTestId } = await renderScreen();
    expect(await findByText('مكتب هندسي')).toBeTruthy();
    expect(getByTestId('services-description').props.children).toBe(
      'سيتم إخفاء جميع الخدمات من صفحتك ولن يتمكن العملاء من رؤيتها وطلبها حالياً. يمكنك إعادة تفعيلها في أي وقت بنقرة واحدة.',
    );
    expect(getByTestId('service-switch-s1').props.accessibilityState.checked).toBe(true);
    expect(getByTestId('service-switch-s2').props.accessibilityState.checked).toBe(false);

    await fireEvent.press(getByTestId('services-edit'));
    expect(router.push).toHaveBeenCalledWith('/edit-service');
  });

  it('the card shows the Figma text with or without a description', async () => {
    api.getMyServices.mockResolvedValue({ ...data, description: null });
    const { findByTestId } = await renderScreen();
    expect((await findByTestId('services-description')).props.children).toBe(
      'سيتم إخفاء جميع الخدمات من صفحتك ولن يتمكن العملاء من رؤيتها وطلبها حالياً. يمكنك إعادة تفعيلها في أي وقت بنقرة واحدة.',
    );
  });

  it('a switch hides its sub-service at once, with «تراجع» showing it again', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await fireEvent.press(await findByTestId('service-switch-s1'));
    await waitFor(() => expect(api.setServiceHidden).toHaveBeenCalledWith('s1', true));
    expect(useServicesToast.getState().toast?.message).toBe('تم اخفاء الخدمة بنجاح.');

    await fireEvent.press(await findByTestId('services-toast-undo'));
    await waitFor(() => expect(api.setServiceHidden).toHaveBeenLastCalledWith('s1', false));
    expect(getByTestId('service-switch-s2')).toBeTruthy();
  });

  it('⋮ › اخفاء الخدمة hides the whole service', async () => {
    const { findByText, getByTestId } = await renderScreen();
    await findByText('مكتب هندسي');
    await fireEvent.press(getByTestId('services-options'));
    await fireEvent.press(getByTestId('services-menu-toggle-hidden'));
    await waitFor(() =>
      expect(api.updateServices).toHaveBeenCalledWith({ servicesHidden: true }),
    );
  });

  it('⋮ › حذف الخدمة نهائيا deletes it after the confirmation', async () => {
    const { findByText, getByTestId, getAllByTestId } = await renderScreen();
    await findByText('مكتب هندسي');
    await fireEvent.press(getByTestId('services-options'));
    await fireEvent.press(getByTestId('services-menu-delete'));
    await fireEvent.press(getAllByTestId('confirm-sheet-confirm')[0]);
    await waitFor(() => expect(api.deleteAllServices).toHaveBeenCalled());
  });

  it('with no services: the empty state opens إضافة خدمة', async () => {
    api.getMyServices.mockResolvedValue({ specialty: null, services: [] });
    const { findByTestId, getByText } = await renderScreen();
    expect(await findByTestId('services-empty')).toBeTruthy();
    await fireEvent.press(getByText('إضافة خدمة'));
    expect(router.push).toHaveBeenCalledWith('/add-service');
  });

  it('adds a sub-service: taken types are greyed, اخرى needs a title', async () => {
    api.createService.mockResolvedValue({ success: true, created: 1 });
    const { findByTestId, getByTestId } = await renderScreen();
    await fireEvent.press(await findByTestId('services-add-sub'));

    expect(
      getByTestId('sub-service-option-مخطط معماري (المساقط)').props.accessibilityState,
    ).toEqual({ checked: true, disabled: true });

    await fireEvent.press(getByTestId('sub-service-option-اخرى'));
    expect(
      getByTestId('add-sub-service-submit').props.accessibilityState?.disabled,
    ).toBe(true);
    await fireEvent.changeText(getByTestId('add-sub-service-title'), 'تصميم حدائق');
    await fireEvent.press(getByTestId('add-sub-service-submit'));
    await waitFor(() =>
      expect(api.createService).toHaveBeenCalledWith({
        specialty: 'مكتب هندسي',
        types: ['اخرى'],
        title: 'تصميم حدائق',
      }),
    );
  });
});

describe('اختر الخدمة الفرعية › اضافة', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getMyServices.mockResolvedValue(data);
    api.createService.mockResolvedValue({ success: true, created: 1 });
  });

  it('adds the ticked types straight from the picker', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await fireEvent.press(await findByTestId('services-add-sub'));
    expect(
      getByTestId('sub-service-picker-add').props.accessibilityState?.disabled,
    ).toBe(true);

    await fireEvent.press(getByTestId('sub-service-option-تصميم الواجهات'));
    await fireEvent.press(getByTestId('sub-service-picker-add'));
    await waitFor(() =>
      expect(api.createService).toHaveBeenCalledWith({
        specialty: 'مكتب هندسي',
        types: ['تصميم الواجهات'],
        title: undefined,
      }),
    );
  });

  it('with «اخرى» ticked it reads «التالي» and adds nothing yet (the title comes first)', async () => {
    const { findByTestId, getByTestId, getByText } = await renderScreen();
    await fireEvent.press(await findByTestId('services-add-sub'));
    await fireEvent.press(getByTestId('sub-service-option-اخرى'));
    expect(getByText('التالي')).toBeTruthy();
    await fireEvent.press(getByTestId('sub-service-picker-add'));
    expect(api.createService).not.toHaveBeenCalled();
  });
});

describe('servicesSummary', () => {
  it('counts the active and hidden sub-services', () => {
    expect(servicesSummary([{}, {}, {}, { isHidden: true }, { isHidden: true }])).toBe(
      '3 خدمات نشطة 2 خدمات مخفية',
    );
    expect(servicesSummary([{}, {}])).toBe('2 خدمات نشطة');
  });
});
