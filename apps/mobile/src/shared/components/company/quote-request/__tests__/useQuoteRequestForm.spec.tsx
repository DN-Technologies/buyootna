import { act, cleanup, render } from '@testing-library/react-native';

import { companyRequestsService } from '@/shared/api/companyRequests.service';

import { useQuoteRequestForm } from '../useQuoteRequestForm';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('@/shared/api/companyRequests.service', () => ({
  companyRequestsService: { create: jest.fn() },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const hookRef = {
  current: null as unknown as ReturnType<typeof useQuoteRequestForm>,
};
const onSent = jest.fn();

// What the sheet is opened with (each test may change it)
let mockServices = [{ id: 's1', title: 'تشطيب' }];
let mockCatalogFallback = false;

function Harness() {
  hookRef.current = useQuoteRequestForm({
    companyName: 'شركة أركان',
    services: mockServices,
    catalogFallback: mockCatalogFallback,
    targetIdentityId: 'company-1',
    onSent,
  });
  return null;
}

const fill = async () => {
  await act(async () => {
    hookRef.current.setServiceId('s1');
    hookRef.current.govArea.setGovernorateId('hawally');
    hookRef.current.govArea.setAreaId('hawally_2');
    hookRef.current.setDescription('تفاصيل');
  });
};

describe('useQuoteRequestForm (company profile sheet)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockServices = [{ id: 's1', title: 'تشطيب' }];
    mockCatalogFallback = false;
  });
  afterEach(() => cleanup());

  // QA: the sheet showed a made-up list (الأثاث / شبكات نت / ديكورات
  // وتصميم) and, from the companies list, sent the request to nobody
  it("offers the company's own request types and sends to it, with the type's specialty", async () => {
    mockServices = [{ id: 'svc-1', title: 'مخططات تنفيذية' }];
    (companyRequestsService.create as jest.Mock).mockResolvedValue({});
    await render(<Harness />);

    expect(hookRef.current.usesCatalog).toBe(false);
    expect(hookRef.current.serviceOptions).toEqual([
      { id: 'svc-1', label: 'مخططات تنفيذية' },
    ]);

    await act(async () => {
      hookRef.current.setServiceId('svc-1');
      hookRef.current.govArea.setGovernorateId('hawally');
      hookRef.current.govArea.setAreaId('hawally_2');
      hookRef.current.setDescription('تفاصيل');
    });
    await act(async () => {
      await hookRef.current.submit();
    });

    expect(companyRequestsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'مخططات تنفيذية',
        category: 'مكتب هندسي',
        targetIdentityId: 'company-1',
      }),
    );
  });

  it('a company with no services yet: the catalogue, specialty first', async () => {
    mockServices = [];
    mockCatalogFallback = true;
    (companyRequestsService.create as jest.Mock).mockResolvedValue({});
    await render(<Harness />);

    expect(hookRef.current.usesCatalog).toBe(true);
    expect(hookRef.current.serviceOptions).toEqual([]);
    expect(hookRef.current.specialtyOptions.length).toBeGreaterThan(0);

    await act(async () => {
      hookRef.current.govArea.setGovernorateId('hawally');
      hookRef.current.govArea.setAreaId('hawally_2');
      hookRef.current.setDescription('تفاصيل');
    });
    // No specialty: not sent
    await act(async () => {
      await hookRef.current.submit();
    });
    expect(companyRequestsService.create).not.toHaveBeenCalled();

    await act(async () => {
      hookRef.current.setSpecialtyId('مكتب هندسي');
    });
    expect(hookRef.current.serviceOptions.map((o) => o.label)).toContain(
      'تصميم الواجهات',
    );
    await act(async () => {
      hookRef.current.setServiceId('تصميم الواجهات');
    });
    await act(async () => {
      await hookRef.current.submit();
    });
    expect(companyRequestsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'تصميم الواجهات',
        category: 'مكتب هندسي',
      }),
    );
  });

  it('an office with no services offers «اخرى», never made-up types', async () => {
    mockServices = [];
    await render(<Harness />);
    expect(hookRef.current.serviceOptions).toEqual([
      { id: 'اخرى', label: 'اخرى' },
    ]);
  });

  it('sends once and empties the form', async () => {
    (companyRequestsService.create as jest.Mock).mockResolvedValue({});
    await render(<Harness />);
    await fill();

    await act(async () => {
      await hookRef.current.submit();
    });

    expect(companyRequestsService.create).toHaveBeenCalledTimes(1);
    // Where it's for: المحافظة - المنطقة, with no map pin
    const sent = (companyRequestsService.create as jest.Mock).mock.calls[0][0];
    expect(sent.location).toBe('حولي - السالمية');
    expect(sent.latitude).toBeUndefined();
    expect(onSent).toHaveBeenCalledTimes(1);
    expect(hookRef.current.serviceId).toBe('');
    expect(hookRef.current.govArea.areaId).toBe('');
    expect(hookRef.current.description).toBe('');
  });

  it('sends once when the button is tapped twice quickly', async () => {
    let resolveCreate: (v: unknown) => void = () => undefined;
    (companyRequestsService.create as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    await render(<Harness />);
    await fill();

    await act(async () => {
      const first = hookRef.current.submit();
      const second = hookRef.current.submit();
      resolveCreate({});
      await Promise.all([first, second]);
    });

    expect(companyRequestsService.create).toHaveBeenCalledTimes(1);
  });

  it('a new governorate clears the area, and both are needed to send', async () => {
    await render(<Harness />);
    await fill();
    await act(async () => {
      hookRef.current.govArea.setGovernorateId('capital');
    });
    expect(hookRef.current.govArea.areaId).toBe('');

    await act(async () => {
      await hookRef.current.submit();
    });
    expect(companyRequestsService.create).not.toHaveBeenCalled();
  });
});
