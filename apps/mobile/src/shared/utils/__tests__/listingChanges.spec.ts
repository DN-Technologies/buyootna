import { useListingStore } from '@/shared/store/useListingStore';
import { hasListingChanges } from '@/shared/utils/listingChanges';
import type { PropertyDetailsDto } from '@/types/property';

jest.mock('@/shared/api/properties.service', () => ({
  propertiesService: { getFeaturesMetadata: jest.fn() },
}));

const ad = (overrides: Partial<PropertyDetailsDto> = {}) =>
  ({
    type: 'SALE',
    category: 'HOUSE',
    price: 90000,
    areaSize: 300,
    beds: 3,
    baths: 2,
    description: 'بيت للبيع',
    phoneNumber: '58094586',
    images: ['https://example.com/a.jpg'],
    features: [{ id: '1', label: 'كراج' }],
    ...overrides,
  }) as PropertyDetailsDto;

const load = (property: PropertyDetailsDto) => {
  useListingStore.getState().resetForm();
  useListingStore.getState().populateFromProperty(property);
};
const changed = (property: PropertyDetailsDto) =>
  hasListingChanges(useListingStore.getState(), property);

describe('hasListingChanges', () => {
  it('is false right after loading an ad', () => {
    const property = ad();
    load(property);
    expect(changed(property)).toBe(false);
  });

  it('is false for land, which has no room or bath counts', () => {
    const property = ad({ category: 'LAND', beds: null, baths: null });
    load(property);
    expect(changed(property)).toBe(false);
  });

  it('notices an edited price, count or description', () => {
    const property = ad();
    const { updateField } = useListingStore.getState();

    load(property);
    updateField('price', '95000');
    expect(changed(property)).toBe(true);

    load(property);
    updateField('rooms', 4);
    expect(changed(property)).toBe(true);

    load(property);
    updateField('adDetails', 'وصف جديد');
    expect(changed(property)).toBe(true);
  });

  it('notices a contact number switched off or a WhatsApp number added', () => {
    const property = ad();
    const { updateField } = useListingStore.getState();

    load(property);
    updateField('showPhone', false);
    expect(changed(property)).toBe(true);

    load(property);
    updateField('showWhatsapp', true);
    updateField('whatsappNumber', '66001122');
    expect(changed(property)).toBe(true);
  });

  it('notices added or removed images', () => {
    const property = ad();
    load(property);
    useListingStore.getState().addImages(['file:///new.jpg']);
    expect(changed(property)).toBe(true);
  });
});
