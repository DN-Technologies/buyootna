import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import AddItemSheet from '../AddItemSheet';
import DiscountSheet from '../DiscountSheet';
import InvoiceGeneralDataStep from '../InvoiceGeneralDataStep';
import InvoiceItemsStep from '../InvoiceItemsStep';
import InvoiceProgressBar from '../InvoiceProgressBar';
import InvoiceReceipt from '../InvoiceReceipt';

jest.mock('@gorhom/bottom-sheet', () => {
  const { TextInput, View } = require('react-native');
  const React = require('react');
  const BottomSheetModal = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({ dismiss: jest.fn() }));
    return <View>{props.children}</View>;
  });
  BottomSheetModal.displayName = 'BottomSheetModal';
  return {
    __esModule: true,
    BottomSheetModal,
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    BottomSheetTextInput: (props: any) => <TextInput {...props} />,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const ITEMS = [
  { name: 'دهانات', price: 200, qty: 2 },
  { name: 'ارضيات', price: 900, qty: 1 },
];

describe('InvoiceProgressBar', () => {
  it('reads "خطوة 2/1" then "خطوة 2/2" and fills the bar on the last step', async () => {
    const first = await render(<InvoiceProgressBar step={1} />);
    expect(first.getByText('خطوة 2/1')).toBeTruthy();
    expect(first.getByTestId('invoice-progress-fill').props.style.width).not.toBe(
      '100%',
    );

    const second = await render(<InvoiceProgressBar step={2} />);
    expect(second.getByText('خطوة 2/2')).toBeTruthy();
    expect(second.getByTestId('invoice-progress-fill').props.style.width).toBe(
      '100%',
    );
  });
});

describe('InvoiceGeneralDataStep', () => {
  const setup = (requestId: string | null, clientName = '') => {
    const onChangeClientName = jest.fn();
    const onSelectClient = jest.fn();
    const utils = render(
      <InvoiceGeneralDataStep
        clientName={clientName}
        onChangeClientName={onChangeClientName}
        requestId={requestId}
        onSelectClient={onSelectClient}
        invoiceNo="INV-2026-000245"
        title=""
        onChangeTitle={jest.fn()}
        warrantyMonths=""
        onChangeWarrantyMonths={jest.fn()}
        issueDate={new Date('2027-04-15T09:00:00Z')}
        onChangeIssueDate={jest.fn()}
      />,
    );
    return { utils, onChangeClientName, onSelectClient };
  };

  it('shows the five fields of بيانات عامة', async () => {
    const { getByText, getByPlaceholderText, getByDisplayValue } =
      await setup(null).utils;

    expect(getByText('بيانات عامة')).toBeTruthy();
    expect(getByPlaceholderText('اسم العميل')).toBeTruthy();
    expect(getByDisplayValue('INV-2026-000245')).toBeTruthy();
    expect(
      getByPlaceholderText('اكتب عنوان للفاتورة حسب ما تم عمله'),
    ).toBeTruthy();
    expect(getByPlaceholderText('اكتب فترة بالشهور')).toBeTruthy();
    expect(getByText(/^تاريخ الاصدار/)).toBeTruthy();
  });

  it('warns that a typed client will not get the invoice in the app', async () => {
    const { getByText } = await setup(null, 'محمد').utils;

    expect(getByText('لن تصل الفاتورة لحساب العميل في التطبيق')).toBeTruthy();
  });

  it('unlinks the picked client when its name is typed over', async () => {
    const { utils, onChangeClientName, onSelectClient } = setup(
      'req-1',
      'محمد علي',
    );
    const { getByTestId, queryByText } = await utils;

    expect(queryByText('لن تصل الفاتورة لحساب العميل في التطبيق')).toBeNull();
    await fireEvent.changeText(getByTestId('invoice-client-name'), 'سالم');
    expect(onSelectClient).toHaveBeenCalledWith(null);
    expect(onChangeClientName).toHaveBeenCalledWith('سالم');
  });
});

describe('InvoiceItemsStep', () => {
  const setup = () => {
    const handlers = {
      onRemoveItem: jest.fn(),
      onOpenAddItemSheet: jest.fn(),
      onOpenDiscountSheet: jest.fn(),
    };
    const utils = render(
      <InvoiceItemsStep
        items={ITEMS}
        subtotal={1300}
        appliedDiscount={0}
        total={1300}
        {...handlers}
      />,
    );
    return { utils, handlers };
  };

  it('lists the items and the totals', async () => {
    const { getByText, getByTestId } = await setup().utils;

    for (const header of ['البند', 'السعر', 'الكمية', 'اجراء']) {
      expect(getByText(header)).toBeTruthy();
    }
    expect(getByText('دهانات')).toBeTruthy();
    expect(getByText('ارضيات')).toBeTruthy();
    expect(getByTestId('invoice-subtotal').props.children.join('')).toBe(
      '1,300 د.ك',
    );
    expect(getByTestId('invoice-total').props.children.join('')).toBe(
      '1,300 د.ك',
    );
    expect(getByText('الاجمالي النهائي')).toBeTruthy();
  });

  it('removes a row, opens the add-item sheet and the discount sheet', async () => {
    const { utils, handlers } = setup();
    const { getByTestId } = await utils;

    await fireEvent.press(getByTestId('invoice-item-remove-1'));
    expect(handlers.onRemoveItem).toHaveBeenCalledWith(1);
    await fireEvent.press(getByTestId('invoice-add-item'));
    expect(handlers.onOpenAddItemSheet).toHaveBeenCalled();
    await fireEvent.press(getByTestId('invoice-discount'));
    expect(handlers.onOpenDiscountSheet).toHaveBeenCalled();
  });
});

describe('AddItemSheet', () => {
  it('works out the total from price and quantity and adds the item', async () => {
    const onAdd = jest.fn();
    const { getByTestId, getByText } = await render(
      <AddItemSheet ref={createRef<BottomSheetModal>()} onAdd={onAdd} />,
    );

    expect(getByText('اضافة بند')).toBeTruthy();
    expect(getByText('السعر الاجمالي للبند')).toBeTruthy();

    await fireEvent.changeText(getByTestId('invoice-item-name'), 'دهانات');
    await fireEvent.changeText(getByTestId('invoice-item-price'), '200');
    await fireEvent.press(getByTestId('invoice-item-qty-plus'));
    expect(getByTestId('invoice-item-qty').props.children).toBe(2);
    expect(getByTestId('invoice-item-total').props.children).toBe('400 د.ك');

    await fireEvent.press(getByTestId('invoice-item-qty-minus'));
    await fireEvent.press(getByTestId('invoice-item-qty-minus'));
    expect(getByTestId('invoice-item-qty').props.children).toBe(1);

    await fireEvent.press(getByTestId('invoice-item-submit'));
    expect(onAdd).toHaveBeenCalledWith({ name: 'دهانات', price: 200, qty: 1 });
  });
});

describe('DiscountSheet', () => {
  it('applies the typed discount', async () => {
    const onApply = jest.fn();
    const { getByTestId, getByText } = await render(
      <DiscountSheet ref={createRef<BottomSheetModal>()} onApply={onApply} />,
    );

    expect(getByText('اضافة خصم')).toBeTruthy();
    await fireEvent.changeText(getByTestId('invoice-discount-input'), '50');
    await fireEvent.press(getByTestId('invoice-discount-submit'));
    expect(onApply).toHaveBeenCalledWith(50);
  });
});

describe('InvoiceReceipt', () => {
  const receipt = (warrantyMonths?: string) => (
    <InvoiceReceipt
      invoiceNo="INV-2026-000245"
      clientName="محمد علي سالم"
      title="ادوات للتشطيب"
      issueDate={new Date('2026-07-05T06:30:00Z')}
      items={ITEMS}
      appliedDiscount={0}
      total={1300}
      companyName="دار العقار الحديث"
      companySpecialty="للمقاولات والتشطيبات"
      warrantyMonths={warrantyMonths}
    />
  );

  it('shows the company, the invoice lines and the total', async () => {
    const { getByText, queryByText } = await render(receipt());

    expect(getByText('دار العقار الحديث')).toBeTruthy();
    expect(getByText('للمقاولات والتشطيبات')).toBeTruthy();
    expect(getByText('INV-2026-000245')).toBeTruthy();
    expect(getByText('محمد علي سالم')).toBeTruthy();
    expect(getByText('ادوات للتشطيب')).toBeTruthy();
    expect(getByText('400 د.ك')).toBeTruthy();
    expect(getByText('1,300 د.ك')).toBeTruthy();
    expect(getByText('شكرا لتعاملكم معنا')).toBeTruthy();
    expect(queryByText('كفالة الخدمة (ضمان)')).toBeNull();
  });

  it('adds the warranty line when the invoice has one', async () => {
    const { getByText } = await render(receipt('3'));

    expect(getByText('كفالة الخدمة (ضمان)')).toBeTruthy();
    expect(getByText('3 شهور')).toBeTruthy();
  });
});
