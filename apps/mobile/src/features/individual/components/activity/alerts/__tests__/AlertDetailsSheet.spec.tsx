import { fireEvent, render } from '@testing-library/react-native';

import { AlertItem } from '@/shared/api/alerts.service';

import AlertDetailsSheet from '../AlertDetailsSheet';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const MockBottomSheetModal = React.forwardRef(
    function MockBottomSheetModal(
      { children }: { children: React.ReactNode },
      _ref: any,
    ) {
      return <>{children}</>;
    },
  );
  MockBottomSheetModal.displayName = 'BottomSheetModal';

  return {
    BottomSheetModal: MockBottomSheetModal,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    BottomSheetBackdrop: () => null,
  };
});

const mockAuctionAlert: AlertItem = {
  id: 'alert-auc-1',
  type: 'AUCTIONS',
  operationType: null,
  governorateId: 'capital',
  areaId: 'capital_1',
  categoryId: 'residential',
  price: null,
  rentValue: null,
  areaSize: null,
  rooms: null,
  baths: null,
  floors: null,
  requestYear: null,
  requiredYear: null,
  amenities: [],
  startDate: '2024-07-12T00:00:00.000Z',
  endDate: '2024-08-08T00:00:00.000Z',
  isActive: true,
  createdAt: '2024-07-01T00:00:00.000Z',
};

const mockPropertiesAlert: AlertItem = {
  id: 'alert-prop-1',
  type: 'PROPERTIES',
  operationType: 'RENT',
  categoryId: 'apartment',
  governorateId: 'hawally',
  areaId: 'hawally_2',
  price: null,
  rentValue: 500,
  areaSize: 150,
  rooms: null,
  baths: null,
  floors: null,
  requestYear: null,
  requiredYear: null,
  amenities: ['parking', 'elevator'],
  startDate: null,
  endDate: null,
  isActive: true,
  createdAt: '2024-07-01T00:00:00.000Z',
};

describe('AlertDetailsSheet', () => {
  it('returns null if no alert is provided', async () => {
    const { queryByTestId } = await render(
      <AlertDetailsSheet alert={null} />,
    );
    expect(queryByTestId('alert-details-close-btn')).toBeNull();
  });

  describe('Auctions Alert', () => {
    it('renders auction details correctly', async () => {
      const { getByTestId, getByText } = await render(
        <AlertDetailsSheet alert={mockAuctionAlert} isActive={true} />,
      );

      expect(getByText('مزادات سكني')).toBeTruthy();
      expect(getByTestId('alert-detail-gov')).toHaveTextContent(/محافظة العاصمة/);
      expect(getByTestId('alert-detail-area')).toHaveTextContent(
        /مدينة جابر الأحمد/,
      );
      expect(getByTestId('alert-detail-category')).toHaveTextContent(/سكني/);
      expect(getByTestId('alert-detail-dates')).toHaveTextContent(
        /12\/7\/2024 حتى 8\/8\/2024/,
      );
    });

    it('handles toggle active switch', async () => {
      const onToggle = jest.fn();
      const { getByTestId } = await render(
        <AlertDetailsSheet
          alert={mockAuctionAlert}
          isActive={true}
          onToggleActive={onToggle}
        />,
      );

      await fireEvent.press(getByTestId('alert-details-toggle-btn'));
      expect(onToggle).toHaveBeenCalledWith('alert-auc-1', false);
    });

    it('handles close button click', async () => {
      const onClose = jest.fn();
      const { getByTestId } = await render(
        <AlertDetailsSheet
          alert={mockAuctionAlert}
          onClose={onClose}
        />,
      );

      await fireEvent.press(getByTestId('alert-details-close-btn'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('handles delete button click', async () => {
      const onDelete = jest.fn();
      const { getByTestId } = await render(
        <AlertDetailsSheet
          alert={mockAuctionAlert}
          onDeletePress={onDelete}
        />,
      );

      await fireEvent.press(getByTestId('alert-details-delete-btn'));
      expect(onDelete).toHaveBeenCalledWith(mockAuctionAlert);
    });

    it('handles edit button click', async () => {
      const onEdit = jest.fn();
      const { getByTestId } = await render(
        <AlertDetailsSheet
          alert={mockAuctionAlert}
          onEditPress={onEdit}
        />,
      );

      await fireEvent.press(getByTestId('alert-details-edit-btn'));
      expect(onEdit).toHaveBeenCalledWith(mockAuctionAlert);
    });
  });

  describe('Properties Alert', () => {
    it('renders property alert fields correctly', async () => {
      const { getByTestId } = await render(
        <AlertDetailsSheet alert={mockPropertiesAlert} isActive={true} />,
      );

      expect(getByTestId('alert-detail-category')).toHaveTextContent(/شقة/);
      expect(getByTestId('alert-detail-operation')).toHaveTextContent(/[إا]يجار/);
      expect(getByTestId('alert-detail-gov')).toHaveTextContent(/محافظة حولي/);
      expect(getByTestId('alert-detail-area')).toHaveTextContent(/السالمية/);
      expect(getByTestId('alert-detail-price')).toHaveTextContent(/500 د\.ك/);
      expect(getByTestId('alert-detail-size')).toHaveTextContent(/150 م²/);
      expect(getByTestId('alert-detail-amenities')).toHaveTextContent(/مواقف سيارات - مصعد/);
    });
  });

  describe('real data only', () => {
    const bare: AlertItem = {
      ...mockPropertiesAlert,
      operationType: 'SALE',
      areaId: null,
      categoryId: null,
      rentValue: null,
      price: null,
      areaSize: null,
      amenities: [],
    };

    it('shows honest placeholders instead of sample values for empty fields', async () => {
      const { getByTestId } = await render(<AlertDetailsSheet alert={bare} />);

      expect(getByTestId('alert-detail-area')).toHaveTextContent(/كل المناطق/);
      expect(getByTestId('alert-detail-category')).toHaveTextContent(/كل الفئات/);
      expect(getByTestId('alert-detail-price')).toHaveTextContent(/غير محدد/);
      expect(getByTestId('alert-detail-size')).toHaveTextContent(/غير محدد/);
      expect(getByTestId('alert-detail-amenities')).toHaveTextContent(/لا يوجد/);
    });

    it('shows rooms/baths/floors and years for exchange alerts', async () => {
      const { getByTestId, queryByTestId } = await render(
        <AlertDetailsSheet
          alert={{
            ...bare,
            operationType: 'EXCHANGE',
            rooms: 3,
            baths: 2,
            floors: 1,
            requestYear: 2026,
            requiredYear: 2027,
          }}
        />,
      );

      expect(getByTestId('alert-detail-specs')).toHaveTextContent(/٣ غرف - ٢ حمام - ١ أدوار/);
      expect(getByTestId('alert-detail-years')).toHaveTextContent(/طلب 2026 مع 2027/);
      expect(queryByTestId('alert-detail-price')).toBeNull();
    });
  });

  describe('matched listings', () => {
    it('shows the match count and opens the matches screen', async () => {
      const onViewMatches = jest.fn();
      const { getByTestId, getByText } = await render(
        <AlertDetailsSheet
          alert={{ ...mockPropertiesAlert, matchCount: 4 }}
          onViewMatchesPress={onViewMatches}
        />,
      );

      expect(getByText(/4 تطابق/)).toBeTruthy();
      await fireEvent.press(getByTestId('alert-details-matches-btn'));
      expect(onViewMatches).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'alert-prop-1' }),
      );
    });

    it('says there is no match yet when nothing matched', async () => {
      const { getByTestId } = await render(
        <AlertDetailsSheet alert={mockPropertiesAlert} />,
      );
      expect(getByTestId('alert-details-matches-btn')).toHaveTextContent(
        /لا يوجد تطابق بعد/,
      );
    });
  });
});
