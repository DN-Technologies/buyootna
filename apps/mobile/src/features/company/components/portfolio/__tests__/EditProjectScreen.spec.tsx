import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { companyService } from '@/shared/api/company.service';

import EditProjectScreen from '../EditProjectScreen';
import { usePortfolioToast } from '../usePortfolioToast';

jest.mock('@/shared/api/company.service', () => ({
  companyService: {
    getMyProjects: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  },
}));
jest.mock('@/shared/api/properties.service', () => ({
  propertiesService: { uploadImages: jest.fn() },
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

const project = {
  id: 'p1',
  title: 'فيلا المطلاع',
  description: 'تشطيب كامل',
  images: ['https://cdn.example/a.jpg', 'https://cdn.example/b.jpg'],
  isHidden: false,
  createdAt: '2025-05-19T10:00:00.000Z',
};

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <EditProjectScreen projectId="p1" />
    </QueryClientProvider>,
  );
}

describe('تعديل المشروع', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePortfolioToast.setState({ toast: null });
    api.getMyProjects.mockResolvedValue([project]);
    api.updateProject.mockResolvedValue({ success: true, project });
    api.deleteProject.mockResolvedValue({ success: true });
  });

  it('starts from the project, with its creation date, and save disabled', async () => {
    const { findByDisplayValue, getByText, getByTestId } = await renderScreen();
    expect(await findByDisplayValue('فيلا المطلاع')).toBeTruthy();
    expect(getByText('تاريخ الانشاء: 19 مايو 2025')).toBeTruthy();
    expect(getByTestId('company-submit').props.accessibilityState?.disabled).toBe(true);
  });

  it('saves only what changed, and goes back', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await fireEvent.changeText(await findByTestId('edit-project-title'), 'فيلا القرين');
    await fireEvent.press(getByTestId('edit-project-image-remove-1'));
    await fireEvent.press(getByTestId('company-submit'));

    await waitFor(() =>
      expect(api.updateProject).toHaveBeenCalledWith('p1', {
        title: 'فيلا القرين',
        images: ['https://cdn.example/a.jpg'],
      }),
    );
    expect(router.back).toHaveBeenCalled();
    expect(usePortfolioToast.getState().toast).toBeNull();
  });

  it('hiding it leaves «تم اخفاء المشروع بنجاح.» on the list; «تراجع» shows it again', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await fireEvent(await findByTestId('edit-project-visibility'), 'valueChange', false);
    await fireEvent.press(getByTestId('company-submit'));

    await waitFor(() =>
      expect(api.updateProject).toHaveBeenCalledWith('p1', { isHidden: true }),
    );
    const toast = usePortfolioToast.getState().toast;
    expect(toast?.message).toBe('تم اخفاء المشروع بنجاح.');
    await toast?.undo();
    expect(api.updateProject).toHaveBeenLastCalledWith('p1', { isHidden: false });
  });

  it('«حذف المشروع نهائيا» deletes it after the confirmation', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await fireEvent.press(await findByTestId('edit-project-delete'));
    await fireEvent.press(getByTestId('confirm-sheet-confirm'));
    await waitFor(() => expect(api.deleteProject).toHaveBeenCalledWith('p1'));
    expect(router.back).toHaveBeenCalled();
  });
});
