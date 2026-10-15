import { fireEvent, render, screen } from '@testing-library/react-native';

import CategoryDetailsFields from '@/shared/components/add-listing/CategoryDetailsFields';
import OwnerDeclaration from '@/shared/components/add-listing/OwnerDeclaration';
import PropertyCategoryFacts from '@/shared/components/property/PropertyCategoryFacts';
import { useListingStore } from '@/shared/store/useListingStore';
import { qualifiesPrice } from '@/shared/utils/clearPrice';

const pick = (id: string, label: string) =>
  useListingStore.getState().updateField('propertyCategory', { id, label });

// Requirements doc ("اضافات في المستقبل"), المتغير حسب الفئة
describe('CategoryDetailsFields', () => {
  beforeEach(() => useListingStore.getState().resetForm());

  it('shows nothing extra for a house or a chalet', async () => {
    pick('house', 'بيت');
    await render(<CategoryDetailsFields />);
    expect(screen.queryByTestId('category-details')).toBeNull();
  });

  it("asks a flat's floor number", async () => {
    pick('apartment', 'شقة');
    await render(<CategoryDetailsFields />);
    expect(screen.getByText('رقم الدور')).toBeTruthy();
    expect(screen.queryByText('عدد الشقق')).toBeNull();
  });

  it("asks a building's flats, rental status, and its income on a rent ad", async () => {
    pick('building', 'عمارة');
    useListingStore.getState().setListingType('rent');
    await render(<CategoryDetailsFields />);

    expect(screen.getByText('عدد الشقق')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('rental-status-مؤجرة بالكامل'));
    expect(useListingStore.getState().rentalStatus).toBe('مؤجرة بالكامل');
    await fireEvent.changeText(screen.getByTestId('input-building-income'), '2,500');
    expect(useListingStore.getState().propertyIncome).toBe('2500');
  });

  it("leaves a building's income to the sale toggle on a sale ad", async () => {
    pick('building', 'عمارة');
    await render(<CategoryDetailsFields />);
    expect(screen.queryByTestId('input-building-income')).toBeNull();
  });

  it("asks land's use (4 kinds) and allocation, but allocation once on exchange", async () => {
    pick('land', 'أرض');
    const view = await render(<CategoryDetailsFields />);
    for (const label of ['سكني', 'استثماري', 'تجاري', 'حرفي']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    await fireEvent.press(screen.getByTestId('land-use-CRAFT'));
    expect(useListingStore.getState().landUse).toBe('CRAFT');
    expect(screen.getByTestId('input-land-allocation')).toBeTruthy();

    useListingStore.getState().setListingType('exchange');
    await view.rerender(<CategoryDetailsFields />);
    expect(screen.queryByTestId('input-land-allocation')).toBeNull();
  });

  it('asks units and monthly income for commercial and investment property', async () => {
    pick('investment', 'استثماري');
    await render(<CategoryDetailsFields />);
    expect(screen.getByText('عدد الوحدات أو المحلات')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('input-monthly-income'), '1800');
    expect(useListingStore.getState().monthlyIncome).toBe('1800');
  });

  it('asks whether a farm is cultivated and built', async () => {
    pick('farm', 'مزرعة');
    await render(<CategoryDetailsFields />);
    await fireEvent(screen.getByTestId('toggle-built'), 'valueChange', true);
    expect(useListingStore.getState().isBuilt).toBe(true);
    expect(screen.getByText('مزروعة')).toBeTruthy();
  });
});

describe('OwnerDeclaration', () => {
  beforeEach(() => useListingStore.getState().resetForm());

  it('ticks and unticks «أنا مالك العقار»', async () => {
    await render(<OwnerDeclaration />);
    await fireEvent.press(screen.getByTestId('owner-declaration'));
    expect(useListingStore.getState().isOwner).toBe(true);
    await fireEvent.press(screen.getByTestId('owner-declaration'));
    expect(useListingStore.getState().isOwner).toBe(false);
  });
});

describe('PropertyCategoryFacts (the ad page)', () => {
  it("shows a building's facts, its rent income and the owner badge", async () => {
    await render(
      <PropertyCategoryFacts
        category="BUILDING"
        type="RENT"
        apartmentsCount={10}
        rentalStatus="مؤجرة جزئياً"
        propertyIncome={2500}
        isOwner
      />,
    );
    expect(screen.getByText('عدد الشقق')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('مؤجرة جزئياً')).toBeTruthy();
    expect(screen.getByText('مدخول العقار')).toBeTruthy();
    expect(screen.getByText('المعلن هو المالك')).toBeTruthy();
  });

  it("shows a ground-floor flat and a land's use", async () => {
    const flat = await render(
      <PropertyCategoryFacts category="APARTMENT" type="SALE" floorNumber={0} />,
    );
    expect(flat.getByText('الأرضي')).toBeTruthy();

    const land = await render(
      <PropertyCategoryFacts category="LAND" type="SALE" landUse="RESIDENTIAL" />,
    );
    expect(land.getByText('سكني')).toBeTruthy();
  });

  it('shows nothing for a house with no owner declaration', async () => {
    await render(<PropertyCategoryFacts category="HOUSE" type="SALE" />);
    expect(screen.queryByTestId('property-category-facts')).toBeNull();
  });
});

describe('qualifiesPrice (same cases as the API)', () => {
  it.each(['السعر حد 120 ألف', 'السعر على السوم', 'السعر مراجعه', 'حده 95,000'])(
    'refuses «%s»',
    (text) => expect(qualifiesPrice(text)).toBe(true),
  );
  it.each(['الحد الشمالي للقسيمة شارع رئيسي', 'بعد مراجعة البلدية', 'السعر 450 د.ك'])(
    'accepts «%s»',
    (text) => expect(qualifiesPrice(text)).toBe(false),
  );
});
