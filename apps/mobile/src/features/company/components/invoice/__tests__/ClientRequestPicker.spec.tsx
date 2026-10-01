import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render } from '@testing-library/react-native';

import { serviceInvoicesService } from '@/shared/api/serviceInvoices.service';

import ClientRequestPicker from '../ClientRequestPicker';

jest.mock('@/shared/api/serviceInvoices.service', () => ({
  serviceInvoicesService: { invoiceableClients: jest.fn() },
}));

const client = {
  requestId: 'req-1',
  title: 'تشطيب محل تجاري',
  clientName: 'سالم',
  acceptedAt: '2026-09-01T00:00:00.000Z',
};

const renderPicker = (selectedRequestId: string | null, onSelect = jest.fn()) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <ClientRequestPicker
        selectedRequestId={selectedRequestId}
        onSelect={onSelect}
      />
    </QueryClientProvider>,
  );

describe('ClientRequestPicker', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(cleanup);

  it("lists the company's accepted requests and picks one", async () => {
    (serviceInvoicesService.invoiceableClients as jest.Mock).mockResolvedValue([
      client,
    ]);
    const onSelect = jest.fn();
    const { findByTestId, getByText } = await renderPicker(null, onSelect);

    await fireEvent.press(await findByTestId('invoice-client-req-1'));

    expect(getByText('تشطيب محل تجاري')).toBeTruthy();
    expect(onSelect).toHaveBeenCalledWith(client);
  });

  it('tapping the picked client clears it', async () => {
    (serviceInvoicesService.invoiceableClients as jest.Mock).mockResolvedValue([
      client,
    ]);
    const onSelect = jest.fn();
    const { findByTestId } = await renderPicker('req-1', onSelect);

    await fireEvent.press(await findByTestId('invoice-client-req-1'));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('explains when there are no accepted requests yet', async () => {
    (serviceInvoicesService.invoiceableClients as jest.Mock).mockResolvedValue(
      [],
    );
    const { findByText } = await renderPicker(null);

    expect(await findByText(/لا توجد طلبات مقبولة بعد/)).toBeTruthy();
  });
});
