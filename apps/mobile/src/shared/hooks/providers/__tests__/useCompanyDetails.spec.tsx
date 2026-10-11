import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react-native';

import { companyService } from '@/shared/api/company.service';
import { useCompanyDetails } from '@/shared/hooks/providers/useCompanyDetails';
import { showAlert } from '@/shared/utils/alert';

jest.mock('@/shared/api/company.service', () => ({
  companyService: {
    getCompanyDetails: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

const mockGetCompanyDetails = companyService.getCompanyDetails as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useCompanyDetails', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('fetches company details when id is provided', async () => {
    const mockCompany = {
      id: 'comp-1',
      name: 'شركة الكويت للمقاولات',
      userId: 'user-comp-1',
      bio: 'نبذة عن الشركة',
      logoUrl: 'https://example.com/logo.png',
      services: [{ id: 'srv-1', title: 'تشطيب' }],
      projects: [{ id: 'prj-1', title: 'فيلا السلام', images: [] }],
    };
    mockGetCompanyDetails.mockResolvedValueOnce(mockCompany);

    const { result } = await renderHook(() => useCompanyDetails('comp-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.company).toEqual(mockCompany);
    });

    expect(mockGetCompanyDetails).toHaveBeenCalledWith('comp-1');
    expect(result.current.services).toEqual(mockCompany.services);
    expect(result.current.projects).toEqual(mockCompany.projects);
    expect(result.current.targetUserId).toBe('user-comp-1');
  });

  it('does not fetch company details when id is omitted', async () => {
    const { result } = await renderHook(() => useCompanyDetails(undefined), {
      wrapper: createWrapper(),
    });

    expect(mockGetCompanyDetails).not.toHaveBeenCalled();
    expect(result.current.company).toBeUndefined();
    expect(result.current.services).toEqual([]);
    expect(result.current.projects).toEqual([]);
    expect(result.current.targetUserId).toBe('');
  });

  it('shows alert when company fetch fails', async () => {
    mockGetCompanyDetails.mockRejectedValueOnce(new Error('Network error'));

    const { result } = await renderHook(() => useCompanyDetails('comp-error'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(showAlert).toHaveBeenCalledWith('خطأ', 'تعذر تحميل بيانات الشركة');
  });
});
