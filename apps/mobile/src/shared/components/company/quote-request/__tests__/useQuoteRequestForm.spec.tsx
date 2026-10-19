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

function Harness() {
  hookRef.current = useQuoteRequestForm({
    companyName: 'شركة أركان',
    services: [{ id: 's1', title: 'تشطيب' }],
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
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => cleanup());

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
