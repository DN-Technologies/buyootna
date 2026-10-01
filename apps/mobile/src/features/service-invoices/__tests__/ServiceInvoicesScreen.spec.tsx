import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';

import { serviceInvoicesService } from '@/shared/api/serviceInvoices.service';
import {
  exportServiceInvoicePdf,
  exportServiceInvoicesPdf,
} from '@/shared/utils/serviceInvoicePdf';

import ServiceInvoicesScreen from '../ServiceInvoicesScreen';

jest.mock('@/shared/api/serviceInvoices.service', () => ({
  serviceInvoicesService: {
    list: jest.fn(),
    listIssued: jest.fn(),
    remove: jest.fn(),
    markPaid: jest.fn(),
  },
}));

jest.mock('@/shared/utils/serviceInvoicePdf', () => ({
  exportServiceInvoicePdf: jest.fn().mockResolvedValue(true),
  exportServiceInvoicesPdf: jest.fn().mockResolvedValue(true),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

const mockPresent = jest.fn();
jest.mock('@gorhom/bottom-sheet', () => {
  const { View, ScrollView } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    BottomSheetModal: React.forwardRef(function MockSheet(
      props: any,
      ref: any,
    ) {
      React.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: jest.fn(),
      }));
      return <View>{props.children}</View>;
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => (
      <ScrollView>{children}</ScrollView>
    ),
  };
});

const invoice = (over: Record<string, unknown> = {}) => ({
  id: 'inv-1',
  invoiceNo: 'INV-2026-00124',
  title: 'تشطيب محل تجاري',
  clientName: 'سالم',
  linkedToClient: true,
  warrantyMonths: '3',
  issueDate: '2026-07-05T06:30:00.000Z',
  items: [{ name: 'دهانات', price: 1300, qty: 1 }],
  subtotal: 1300,
  discount: 0,
  total: 1300,
  paidAt: '2026-05-05T10:00:00.000Z',
  createdAt: '2026-05-05T10:00:00.000Z',
  company: { name: 'دار العقار الحديث', logoUrl: null, specialty: 'للمقاولات والتشطيبات' },
  ...over,
});

const renderScreen = (mode: 'client' | 'company') => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ServiceInvoicesScreen mode={mode} />
    </QueryClientProvider>,
  );
};

describe('ServiceInvoicesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  afterEach(cleanup);

  it('lists the client invoices with amount and payment date', async () => {
    (serviceInvoicesService.list as jest.Mock).mockResolvedValue([invoice()]);
    const { findAllByText, getByText } = await renderScreen('client');

    expect((await findAllByText('INV-2026-00124')).length).toBeGreaterThan(0);
    expect(getByText('تشطيب محل تجاري')).toBeTruthy();
    expect(getByText('تم الدفع في: 5 مايو 2026')).toBeTruthy();
  });

  it('shows the empty state', async () => {
    (serviceInvoicesService.list as jest.Mock).mockResolvedValue([]);
    const { findByText } = await renderScreen('client');

    expect(await findByText('لا توجد فواتير للخدمات حتى الآن')).toBeTruthy();
  });

  it('searches and sorts through the API', async () => {
    (serviceInvoicesService.list as jest.Mock).mockResolvedValue([invoice()]);
    const { findByTestId, getByTestId } = await renderScreen('client');

    await fireEvent.changeText(await findByTestId('service-invoices-search'), 'دار');
    await waitFor(() =>
      expect(serviceInvoicesService.list).toHaveBeenLastCalledWith({
        search: 'دار',
        sort: undefined,
      }),
    );

    await fireEvent.press(getByTestId('sort-option-oldest'));
    await waitFor(() =>
      expect(serviceInvoicesService.list).toHaveBeenLastCalledWith({
        search: 'دار',
        sort: 'oldest',
      }),
    );
  });

  it('downloads one invoice from its card, and all from the header', async () => {
    (serviceInvoicesService.list as jest.Mock).mockResolvedValue([invoice()]);
    const { findByTestId, getByTestId } = await renderScreen('client');

    await fireEvent.press(await findByTestId('service-invoice-download-inv-1'));
    await waitFor(() =>
      expect(exportServiceInvoicePdf).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'inv-1' }),
      ),
    );
    await fireEvent.press(getByTestId('service-invoices-export-all'));
    await waitFor(() => expect(exportServiceInvoicesPdf).toHaveBeenCalled());
  });

  it('opens the details and deletes after confirming', async () => {
    (serviceInvoicesService.list as jest.Mock)
      .mockResolvedValueOnce([invoice()])
      .mockResolvedValue([]);
    (serviceInvoicesService.remove as jest.Mock).mockResolvedValue(undefined);
    const { findByTestId, getByTestId, getByText } = await renderScreen('client');

    await fireEvent.press(await findByTestId('service-invoice-inv-1'));
    expect(getByText('تفاصيل الفاتورة')).toBeTruthy();
    expect(getByText('للمقاولات والتشطيبات')).toBeTruthy();
    expect(getByText('3 شهور')).toBeTruthy();

    await fireEvent.press(getByTestId('invoice-details-delete'));
    await act(async () => {
      fireEvent.press(getByTestId('delete-invoice-confirm'));
    });

    await waitFor(() =>
      expect(serviceInvoicesService.remove).toHaveBeenCalledWith('inv-1'),
    );
  });

  it('the company sees its issued invoices, can mark one paid and start a new one', async () => {
    (serviceInvoicesService.listIssued as jest.Mock).mockResolvedValue([
      invoice({ paidAt: null }),
    ]);
    (serviceInvoicesService.markPaid as jest.Mock).mockResolvedValue(
      invoice({ paidAt: '2026-10-01T10:00:00.000Z' }),
    );
    const { findByTestId, getByTestId, getAllByText, queryByTestId } =
      await renderScreen('company');

    await fireEvent.press(await findByTestId('service-invoice-inv-1'));
    expect(getAllByText('بانتظار الدفع').length).toBeGreaterThan(0);
    expect(queryByTestId('invoice-details-delete')).toBeNull();

    await fireEvent.press(getByTestId('invoice-details-mark-paid'));
    await waitFor(() =>
      expect(serviceInvoicesService.markPaid).toHaveBeenCalledWith('inv-1'),
    );
    await waitFor(() =>
      expect(queryByTestId('invoice-details-mark-paid')).toBeNull(),
    );

    await fireEvent.press(getByTestId('service-invoices-new'));
    expect(mockPush).toHaveBeenCalledWith('/create-invoice');
  });
});
