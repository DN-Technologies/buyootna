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
  plansService: { getPublishOptions: jest.fn() },
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

  it('shows rooms and baths, without floors, for a house', async () => {
    const { getByText, queryByText } = await stepperRow('house');
    expect(getByText('عدد الغرف')).toBeTruthy();
    expect(getByText('عدد الحمامات')).toBeTruthy();
    expect(queryByText('عدد الادوار')).toBeNull();
  });

  it('adds floors for an apartment and a building', async () => {
    expect((await stepperRow('apartment')).getByText('عدد الادوار')).toBeTruthy();
    expect((await stepperRow('building')).getByText('عدد الادوار')).toBeTruthy();
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

  it('shows the counts an apartment has', async () => {
    const { updateField } = useListingStore.getState();
    updateField('propertyCategory', { id: 'apartment', label: 'شقة' });

    const { getByText } = await preview();

    expect(getByText('عدد الغرف')).toBeTruthy();
    expect(getByText('عدد الحمامات')).toBeTruthy();
    expect(getByText('عدد الادوار')).toBeTruthy();
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
  });
});
