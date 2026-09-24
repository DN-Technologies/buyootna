import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react-native';

import { officeService } from '@/shared/api/office.service';
import { useOfficeDetails } from '@/shared/hooks/useOfficeDetails';
import { showAlert } from '@/shared/utils/alert';

jest.mock('@/shared/api/office.service', () => ({
  officeService: {
    getOfficeDetails: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

const mockGetOfficeDetails = officeService.getOfficeDetails as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe('useOfficeDetails', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('fetches office details when id is provided', async () => {
    const mockOffice = {
      id: 'off-1',
      name: 'مكتب الأندلس العقاري',
      userId: 'user-off-1',
      bio: 'أفضل العروض العقارية',
      logoUrl: 'https://example.com/logo.png',
      licenseNumber: 'LIC-1234',
      services: [{ id: 'srv-1', title: 'إدارة أملاك' }],
      properties: [{ id: 'prop-1', title: 'شقة للإيجار' }],
      workingHours: [{ day: 'الأحد', hours: '9am - 5pm' }],
    };
    mockGetOfficeDetails.mockResolvedValueOnce(mockOffice);

    const { result } = await renderHook(() => useOfficeDetails('off-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.office).toEqual(mockOffice);
    });

    expect(mockGetOfficeDetails).toHaveBeenCalledWith('off-1');
    expect(result.current.services).toEqual(mockOffice.services);
    expect(result.current.properties).toEqual(mockOffice.properties);
    expect(result.current.workingHours).toEqual(mockOffice.workingHours);
    expect(result.current.targetUserId).toBe('user-off-1');
  });

  it('does not fetch office details when id is omitted', async () => {
    const { result } = await renderHook(() => useOfficeDetails(undefined), {
      wrapper: createWrapper(),
    });

    expect(mockGetOfficeDetails).not.toHaveBeenCalled();
    expect(result.current.office).toBeUndefined();
    expect(result.current.services).toEqual([]);
    expect(result.current.properties).toEqual([]);
    expect(result.current.workingHours).toBeUndefined();
    expect(result.current.targetUserId).toBe('');
  });

  it('shows alert when office fetch fails', async () => {
    mockGetOfficeDetails.mockRejectedValueOnce(new Error('Network error'));

    const { result } = await renderHook(() => useOfficeDetails('off-error'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(showAlert).toHaveBeenCalledWith('خطأ', 'تعذر تحميل بيانات المكتب');
  });
});
