import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { companyService } from '@/shared/api/company.service';

import { visibleProjects } from '../portfolio.utils';
import PortfolioScreen from '../PortfolioScreen';
import { usePortfolioToast } from '../usePortfolioToast';

jest.mock('@/shared/api/company.service', () => ({
  companyService: {
    getMyProjects: jest.fn(),
    setAllProjectsHidden: jest.fn(),
    deleteAllProjects: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
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

const project = (id: string, title: string, createdAt: string, isHidden = false) => ({
  id,
  title,
  description: `وصف ${title}`,
  images: [`https://cdn.example/${id}.jpg`],
  isHidden,
  createdAt,
});

const mutlaa = project('p1', 'فيلا المطلاع', '2026-10-01T00:00:00.000Z');
const salmiya = project('p2', 'شقة السالمية', '2026-09-01T00:00:00.000Z', true);

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PortfolioScreen />
    </QueryClientProvider>,
  );
}

describe('معرض الأعمال', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePortfolioToast.setState({ toast: null });
    api.getMyProjects.mockResolvedValue([mutlaa, salmiya]);
    api.setAllProjectsHidden.mockResolvedValue({ success: true, updated: 2 });
    api.deleteAllProjects.mockResolvedValue({ success: true, deleted: 2 });
  });

  it('lists the projects, marks a hidden one «مخفي», and opens edit and add', async () => {
    const { findByText, getByTestId, getByText, queryByTestId } = await renderScreen();
    expect(await findByText('فيلا المطلاع')).toBeTruthy();
    expect(getByTestId('portfolio-project-hidden-p2')).toBeTruthy();
    expect(queryByTestId('portfolio-project-hidden-p1')).toBeNull();

    await fireEvent.press(getByTestId('portfolio-edit-p1'));
    expect(router.push).toHaveBeenCalledWith('/edit-project/p1');
    await fireEvent.press(getByText('اضافة مشروع'));
    expect(router.push).toHaveBeenCalledWith('/add-project');
  });

  it('searches title and description, with the count and the no-match state', async () => {
    const { findByText, getByTestId, queryByText } = await renderScreen();
    await findByText('فيلا المطلاع');

    await fireEvent.changeText(getByTestId('portfolio-search'), 'المطلاع');
    expect(getByTestId('portfolio-results-count').props.children).toEqual([1, ' نتائج بحث']);
    expect(queryByText('شقة السالمية')).toBeNull();

    await fireEvent.changeText(getByTestId('portfolio-search'), 'لا شيء');
    expect(getByTestId('portfolio-no-matches')).toBeTruthy();
  });

  it('with no projects: the empty state and its add button', async () => {
    api.getMyProjects.mockResolvedValue([]);
    const { findByTestId, getByText } = await renderScreen();
    expect(await findByTestId('portfolio-empty')).toBeTruthy();
    await fireEvent.press(getByText('إضافة مشروع'));
    expect(router.push).toHaveBeenCalledWith('/add-project');
  });

  it('⋮ › اخفاء جميع المشاريع hides them all after the confirmation, with «تراجع»', async () => {
    const { findByText, getByTestId, getAllByTestId } = await renderScreen();
    await findByText('فيلا المطلاع');

    await fireEvent.press(getByTestId('portfolio-options'));
    await fireEvent.press(getByTestId('portfolio-options-toggle-hidden'));
    // Both sheets are mounted; the hide-all one comes first
    await fireEvent.press(getAllByTestId('confirm-sheet-confirm')[0]);
    await waitFor(() => expect(api.setAllProjectsHidden).toHaveBeenCalledWith(true));
    await waitFor(() => expect(getByTestId('portfolio-toast')).toBeTruthy());

    await fireEvent.press(getByTestId('portfolio-toast-undo'));
    await waitFor(() => expect(api.setAllProjectsHidden).toHaveBeenLastCalledWith(false));
  });

  it('⋮ › حذف الكل deletes every project after the confirmation', async () => {
    const { findByText, getByTestId, getAllByTestId } = await renderScreen();
    await findByText('فيلا المطلاع');
    await fireEvent.press(getByTestId('portfolio-options'));
    await fireEvent.press(getByTestId('portfolio-options-delete-all'));
    await fireEvent.press(getAllByTestId('confirm-sheet-confirm')[1]);
    await waitFor(() => expect(api.deleteAllProjects).toHaveBeenCalled());
  });

  it('shows the toast the edit screen left, and its «تراجع» runs the undo', async () => {
    const undo = jest.fn().mockResolvedValue(undefined);
    const { findByText, findByTestId } = await renderScreen();
    await findByText('فيلا المطلاع');
    await act(async () => {
      usePortfolioToast.getState().show('تم اخفاء المشروع بنجاح.', undo);
    });
    await fireEvent.press(await findByTestId('portfolio-toast-undo'));
    expect(undo).toHaveBeenCalled();
  });
});

describe('visibleProjects (الترتيب حسب)', () => {
  const list = [mutlaa, salmiya];
  it('الكل keeps the order; الأحدث / الأقدم sort by creation', () => {
    expect(visibleProjects(list, '', 'ALL')).toBe(list);
    expect(visibleProjects(list, '', 'OLDEST').map((p) => p.id)).toEqual(['p2', 'p1']);
    expect(visibleProjects([salmiya, mutlaa], '', 'NEWEST').map((p) => p.id)).toEqual(['p1', 'p2']);
  });
});
