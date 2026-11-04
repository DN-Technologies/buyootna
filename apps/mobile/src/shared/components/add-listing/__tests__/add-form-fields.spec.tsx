import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react-native';

import { plansService } from '@/shared/api/plans.service';
import AdLevelSection from '@/shared/components/add-listing/AdLevelSection';
import ContactToggles from '@/shared/components/add-listing/ContactToggles';
import PreviewDetailsCard from '@/shared/components/add-listing/PreviewDetailsCard';
import PropertyStepperRow from '@/shared/components/add-listing/PropertyStepperRow';
import { useListingStore } from '@/shared/store/useListingStore';
import { getCategoryFields } from '@/shared/utils/data/propertyCategories';

jest.mock('@/shared/api/plans.service', () => ({
  plansService: {
    getPublishOptions: jest.fn(),
    getWallet: jest.fn(() => Promise.resolve({ freeAdsRemaining: 0 })),
  },
}));
jest.mock('@/shared/api/properties.service', () => ({
  propertiesService: { getFeaturesMetadata: jest.fn() },
}));

const mockGetOptions = plansService.getPublishOptions as jest.Mock;

const stepperRow = async (categoryId: string) =>
  render(
    <PropertyStepperRow
      fields={getCategoryFields(categoryId)}
      rooms={1}
      baths={1}
      floors={0}
      onChangeRooms={jest.fn()}
      onChangeBaths={jest.fn()}
      onChangeFloors={jest.fn()}
    />,
  );

describe('PropertyStepperRow', () => {
  it('shows nothing for land or a farm', async () => {
    expect((await stepperRow('land')).queryByTestId('stepper-row')).toBeNull();
    expect((await stepperRow('farm')).queryByTestId('stepper-row')).toBeNull();
  });

  it('shows rooms, baths and floors for a house', async () => {
    const { getByText } = await stepperRow('house');
    expect(getByText('عدد الغرف')).toBeTruthy();
    expect(getByText('عدد الحمامات')).toBeTruthy();
    expect(getByText('عدد الادوار')).toBeTruthy();
  });

  it('has no floors count on a flat, and only floors on a building', async () => {
    expect((await stepperRow('apartment')).queryByText('عدد الادوار')).toBeNull();
    const building = await stepperRow('building');
    expect(building.getByText('عدد الادوار')).toBeTruthy();
    expect(building.queryByText('عدد الغرف')).toBeNull();
    expect(building.queryByText('عدد الحمامات')).toBeNull();
  });
});

describe('PreviewDetailsCard', () => {
  beforeEach(() => {
    useListingStore.getState().resetForm();
  });

  const preview = async () =>
    render(<PreviewDetailsCard draftData={useListingStore.getState()} />);

  it('leaves out rooms, baths, floors and age for land', async () => {
    const { updateField } = useListingStore.getState();
    updateField('propertyCategory', { id: 'land', label: 'أرض' });

    const { queryByText, getByText } = await preview();

    expect(getByText('أرض')).toBeTruthy();
    expect(queryByText('عدد الغرف')).toBeNull();
    expect(queryByText('عدد الحمامات')).toBeNull();
    expect(queryByText('عدد الادوار')).toBeNull();
    expect(queryByText('عمر العقار')).toBeNull();
  });

  it("shows what a flat has: rooms, baths and its floor number", async () => {
    const { updateField } = useListingStore.getState();
    updateField('propertyCategory', { id: 'apartment', label: 'شقة' });
    updateField('floorNumber', 3);

    const { getByText, queryByText } = await preview();

    expect(getByText('عدد الغرف')).toBeTruthy();
    expect(getByText('عدد الحمامات')).toBeTruthy();
    expect(getByText('رقم الدور')).toBeTruthy();
    expect(queryByText('عدد الادوار')).toBeNull();
  });

  it("shows land's use and a farm's مزروعة / مبنية", async () => {
    const { updateField } = useListingStore.getState();
    updateField('propertyCategory', { id: 'land', label: 'أرض' });
    updateField('landUse', 'COMMERCIAL');
    const land = await preview();
    expect(land.getByText('نوع التخصيص')).toBeTruthy();
    expect(land.getAllByText('تجاري').length).toBeGreaterThan(0);

    updateField('propertyCategory', { id: 'farm', label: 'مزرعة' });
    updateField('isBuilt', true);
    const farm = await preview();
    expect(farm.getByText('مزروعة')).toBeTruthy();
    expect(farm.getByText('مبنية')).toBeTruthy();
  });

  it('shows only the contact numbers that are switched on', async () => {
    const { updateField } = useListingStore.getState();
    updateField('phoneNumber', '58094586');
    updateField('showPhone', false);
    updateField('showWhatsapp', true);
    updateField('whatsappNumber', '66001122');

    const { queryByText, getByText } = await preview();

    expect(queryByText('رقم الهاتف')).toBeNull();
    expect(getByText('رقم الواتساب')).toBeTruthy();
    expect(getByText('66001122')).toBeTruthy();
  });
});

describe('ContactToggles', () => {
  beforeEach(() => {
    useListingStore.getState().resetForm();
  });

  it('reveals the WhatsApp input only once its toggle is on', async () => {
    const { getByTestId, queryByTestId } = await render(<ContactToggles />);

    expect(getByTestId('input-phone')).toBeTruthy();
    expect(queryByTestId('input-whatsapp')).toBeNull();

    await act(async () => {
      fireEvent(getByTestId('toggle-whatsapp'), 'valueChange', true);
    });
    expect(getByTestId('input-whatsapp')).toBeTruthy();

    await act(async () => {
      fireEvent(getByTestId('toggle-phone'), 'valueChange', false);
    });
    expect(queryByTestId('input-phone')).toBeNull();
  });
});

describe('AdLevelSection', () => {
  const slot = (adsRemaining: number, featuredDays: number) => ({
    type: 'PLAN_SLOT',
    slotId: `slot-${featuredDays}`,
    adsRemaining,
    featuredDays,
  });
  const renderSection = async () =>
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <AdLevelSection />
      </QueryClientProvider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    useListingStore.getState().resetForm();
  });

  it('stays hidden when the user only has the free ad', async () => {
    mockGetOptions.mockResolvedValue({
      canPublish: true,
      options: [{ type: 'FREE_QUOTA', slotId: 'FREE_QUOTA', adsRemaining: 1, featuredDays: 0 }],
    });

    const { queryByText } = await renderSection();

    await waitFor(() => expect(mockGetOptions).toHaveBeenCalled());
    expect(queryByText('اختر نوع اعلانك')).toBeNull();
  });

  it('shows what is left of each level from the packages', async () => {
    mockGetOptions.mockResolvedValue({
      canPublish: true,
      options: [slot(6, 0), slot(2, 30)],
    });

    const { findByText, getByText, getByTestId } = await renderSection();

    expect(await findByText('اختر نوع اعلانك')).toBeTruthy();
    expect(getByText('6')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('ad-level-premium'));
    });
    expect(useListingStore.getState().adLevel).toBe('premium');
    expect(useListingStore.getState().adLevelChosen).toBe(true);
  });

  // QA: عادي was preselected (an ad went on without a choice), and a level
  // with nothing left could still be picked
  it('starts with no level picked and asks for one', async () => {
    mockGetOptions.mockResolvedValue({
      canPublish: true,
      options: [slot(1, 0), slot(2, 30)],
    });

    const { findByTestId, getByTestId, queryByTestId } = await renderSection();

    expect(await findByTestId('ad-level-required')).toBeTruthy();
    expect(
      getByTestId('ad-level-normal').props.accessibilityState?.selected,
    ).toBe(false);
    expect(
      getByTestId('ad-level-premium').props.accessibilityState?.selected,
    ).toBe(false);

    await act(async () => {
      fireEvent.press(getByTestId('ad-level-normal'));
    });
    expect(useListingStore.getState().adLevelChosen).toBe(true);
    expect(queryByTestId('ad-level-required')).toBeNull();
  });

  it('greys out مميز with none left, and it cannot be picked', async () => {
    mockGetOptions.mockResolvedValue({
      canPublish: true,
      options: [slot(1, 0), slot(0, 30)],
    });

    const { findByTestId, getByTestId } = await renderSection();

    await findByTestId('ad-level-required');
    const premium = getByTestId('ad-level-premium');
    expect(premium.props.accessibilityState?.disabled).toBe(true);
    await act(async () => {
      fireEvent.press(premium);
    });
    expect(useListingStore.getState().adLevelChosen).toBe(false);
    expect(useListingStore.getState().adLevel).toBe('normal');
    expect(
      getByTestId('ad-level-normal').props.accessibilityState?.disabled,
    ).toBe(false);
  });

  it('keeps عادي pickable when only the free ad is left for it', async () => {
    (plansService.getWallet as jest.Mock).mockResolvedValueOnce({
      freeAdsRemaining: 1,
    });
    mockGetOptions.mockResolvedValue({
      canPublish: true,
      options: [slot(0, 0), slot(2, 30)],
    });

    const { findByTestId, getByTestId } = await renderSection();

    await findByTestId('ad-level-required');
    await waitFor(() =>
      expect(
        getByTestId('ad-level-normal').props.accessibilityState?.disabled,
      ).toBe(false),
    );
  });

  it('asks for nothing when no level has anything left', async () => {
    mockGetOptions.mockResolvedValue({
      canPublish: true,
      options: [slot(0, 0), slot(0, 30)],
    });

    const { findByText, queryByTestId } = await renderSection();

    await findByText('اختر نوع اعلانك');
    expect(queryByTestId('ad-level-required')).toBeNull();
  });

  it('an edited ad keeps its level, even with none of it left', async () => {
    mockGetOptions.mockResolvedValue({
      canPublish: true,
      options: [slot(1, 0), slot(0, 30)],
    });
    useListingStore.setState({ adLevel: 'premium', adLevelChosen: true });

    const { findByText, getByTestId, queryByTestId } = await renderSection();

    await findByText('اختر نوع اعلانك');
    const premium = getByTestId('ad-level-premium');
    expect(premium.props.accessibilityState?.selected).toBe(true);
    expect(premium.props.accessibilityState?.disabled).toBe(false);
    expect(queryByTestId('ad-level-required')).toBeNull();
  });
});
