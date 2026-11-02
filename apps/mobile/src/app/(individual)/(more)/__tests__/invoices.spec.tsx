import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';

import { invoicesService } from '@/shared/api/invoices.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import InvoicesScreen from '../invoices';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));
jest.mock('@/shared/api/invoices.service', () => ({
  invoicesService: { getInvoices: jest.fn() },
}));

const asProfile = (type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE') =>
  useAuthStore.setState({ activeIdentity: { id: 'p1', type } as never });

const screen = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <InvoicesScreen />
    </QueryClientProvider>,
  );

describe('InvoicesScreen with no invoices: استعرض الباقات', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (invoicesService.getInvoices as jest.Mock).mockResolvedValue([]);
  });

  it.each([
    ['COMPANY', '/company-plans'],
    ['INDIVIDUAL', '/plans'],
    ['OFFICE', '/plans'],
  ] as const)('%s opens %s', async (type, route) => {
    asProfile(type);
    const { findByText } = await screen();
    fireEvent.press(await findByText('استعرض الباقات'));
    expect(mockPush).toHaveBeenCalledWith(route);
  });
});
