import { isListingFormValid, useListingStore } from '../useListingStore';

describe('useListingStore addImages', () => {
  beforeEach(() => {
    useListingStore.getState().resetForm();
  });

  it('appends images up to the 10-image cap', () => {
    const uris = Array.from({ length: 5 }, (_, i) => `uri-${i}`);
    useListingStore.getState().addImages(uris);
    expect(useListingStore.getState().images).toEqual(uris);
  });

  it('never lets the store exceed 10 images regardless of how many are added', () => {
    useListingStore.getState().addImages(
      Array.from({ length: 10 }, (_, i) => `uri-${i}`),
    );
    // Simulates the selectionLimit=0 native-picker bug: caller adds more
    // even though the UI should have already blocked/limited it.
    useListingStore.getState().addImages(['uri-extra-1', 'uri-extra-2']);

    expect(useListingStore.getState().images).toHaveLength(10);
  });
});

describe('useListingStore property income', () => {
  beforeEach(() => {
    useListingStore.getState().resetForm();
  });

  it('sends propertyIncome for a sale listing only when the toggle is on', () => {
    const { updateField } = useListingStore.getState();
    updateField('propertyIncome', '350');

    let payload = useListingStore.getState().buildApiPayload(false, []);
    expect(payload.propertyIncome).toBeUndefined();

    updateField('showIncome', true);
    payload = useListingStore.getState().buildApiPayload(false, []);
    expect(payload.propertyIncome).toBe(350);
  });

  it('restores the saved income when editing a listing', () => {
    useListingStore.getState().populateFromProperty({
      type: 'SALE',
      category: 'APARTMENT',
      price: 90000,
      propertyIncome: 350,
    } as unknown as Parameters<
      ReturnType<typeof useListingStore.getState>['populateFromProperty']
    >[0]);

    const state = useListingStore.getState();
    expect(state.showIncome).toBe(true);
    expect(state.propertyIncome).toBe('350');
  });

  it('leaves the income toggle off for listings without income', () => {
    useListingStore.getState().populateFromProperty({
      type: 'SALE',
      category: 'APARTMENT',
      price: 90000,
      propertyIncome: null,
    } as unknown as Parameters<
      ReturnType<typeof useListingStore.getState>['populateFromProperty']
    >[0]);

    const state = useListingStore.getState();
    expect(state.showIncome).toBe(false);
    expect(state.propertyIncome).toBe('');
  });
});

describe('useListingStore category-driven fields', () => {
  beforeEach(() => {
    useListingStore.getState().resetForm();
  });

  const pick = (id: string, label: string) =>
    useListingStore.getState().updateField('propertyCategory', { id, label });

  it('sends no rooms, baths, floors or age for land', () => {
    const { updateField } = useListingStore.getState();
    pick('land', 'أرض');
    updateField('rooms', 3);
    updateField('baths', 2);
    updateField('floors', 1);
    updateField('propertyAge', '5');

    const payload = useListingStore.getState().buildApiPayload(false, []);

    expect(payload.category).toBe('LAND');
    expect(payload).not.toHaveProperty('beds');
    expect(payload).not.toHaveProperty('baths');
    expect(payload).not.toHaveProperty('floors');
    expect(payload).not.toHaveProperty('propertyAge');
  });

  // Requirements doc: a house has floors; a flat its floor number instead
  it('sends rooms, baths and floors for a house', () => {
    const { updateField } = useListingStore.getState();
    pick('house', 'بيت');
    updateField('rooms', 4);
    updateField('baths', 3);
    updateField('floors', 2);

    const payload = useListingStore.getState().buildApiPayload(false, []);

    expect(payload).toMatchObject({ category: 'HOUSE', beds: 4, baths: 3, floors: 2 });
    expect(payload).not.toHaveProperty('floorNumber');
  });

  it("sends a flat's floor number, not a floors count", () => {
    const { updateField } = useListingStore.getState();
    updateField('floors', 6);
    updateField('floorNumber', 3);
    pick('apartment', 'شقة');

    const payload = useListingStore.getState().buildApiPayload(false, []);
    expect(payload).toMatchObject({ floorNumber: 3, beds: 1, baths: 1 });
    expect(payload).not.toHaveProperty('floors');
  });

  it("sends a building's floors, flats, rental status and income, without rooms", () => {
    const { updateField } = useListingStore.getState();
    useListingStore.getState().setListingType('rent');
    pick('building', 'عمارة');
    updateField('floors', 5);
    updateField('apartmentsCount', 10);
    updateField('rentalStatus', 'مؤجرة جزئياً');
    updateField('propertyIncome', '2500');

    const payload = useListingStore.getState().buildApiPayload(false, []);
    expect(payload).toMatchObject({
      floors: 5,
      apartmentsCount: 10,
      rentalStatus: 'مؤجرة جزئياً',
      propertyIncome: 2500,
    });
    expect(payload).not.toHaveProperty('beds');
    expect(payload).not.toHaveProperty('baths');
  });

  it("sends land's use and allocation, and nothing else of the category's", () => {
    const { updateField } = useListingStore.getState();
    pick('land', 'أرض');
    updateField('landUse', 'CRAFT');
    updateField('allocationState', 'مخصصة');
    updateField('unitsCount', 4);

    const payload = useListingStore.getState().buildApiPayload(false, []);
    expect(payload).toMatchObject({ landUse: 'CRAFT', allocationStatus: 'مخصصة' });
    expect(payload).not.toHaveProperty('unitsCount');
    expect(payload).not.toHaveProperty('propertyAge');
  });

  it('sends units and monthly income for commercial and investment property', () => {
    const { updateField } = useListingStore.getState();
    updateField('unitsCount', 6);
    updateField('monthlyIncome', '1800');
    for (const [id, label] of [
      ['commercial', 'تجاري'],
      ['investment', 'استثماري'],
    ]) {
      pick(id, label);
      expect(useListingStore.getState().buildApiPayload(false, [])).toMatchObject({
        unitsCount: 6,
        monthlyIncome: 1800,
      });
    }
  });

  it("sends a farm's مزروعة / مبنية and the owner's declaration", () => {
    const { updateField } = useListingStore.getState();
    pick('farm', 'مزرعة');
    updateField('isCultivated', true);
    updateField('isOwner', true);

    expect(useListingStore.getState().buildApiPayload(false, [])).toMatchObject({
      isCultivated: true,
      isBuilt: false,
      isOwner: true,
    });
  });

  it('maps a farm to the new FARM category', () => {
    pick('farm', 'مزرعة');
    expect(useListingStore.getState().buildApiPayload(false, []).category).toBe(
      'FARM',
    );
  });

  it('drops a category the new listing type does not offer', () => {
    pick('apartment', 'شقة');
    useListingStore.getState().setListingType('exchange');
    expect(useListingStore.getState().propertyCategory).toBeNull();

    pick('land', 'أرض');
    useListingStore.getState().setListingType('sell');
    expect(useListingStore.getState().propertyCategory?.id).toBe('land');
  });

  it('keeps a legacy category when editing an old ad', () => {
    useListingStore.getState().populateFromProperty({
      type: 'SALE',
      category: 'RESIDENTIAL',
      beds: null,
      baths: null,
    } as unknown as Parameters<
      ReturnType<typeof useListingStore.getState>['populateFromProperty']
    >[0]);

    const state = useListingStore.getState();
    expect(state.propertyCategory).toEqual({ id: 'residential', label: 'سكني' });
    expect(state.buildApiPayload(false, []).category).toBe('RESIDENTIAL');
  });
});

describe('useListingStore contact numbers', () => {
  beforeEach(() => {
    useListingStore.getState().resetForm();
  });

  it('sends each number only while its toggle is on', () => {
    const { updateField } = useListingStore.getState();
    updateField('phoneNumber', '58094586');
    updateField('whatsappNumber', '66001122');

    let payload = useListingStore.getState().buildApiPayload(false, []);
    expect(payload.phoneNumber).toBe('58094586');
    expect(payload).not.toHaveProperty('whatsappNumber');

    updateField('showPhone', false);
    updateField('showWhatsapp', true);
    payload = useListingStore.getState().buildApiPayload(false, []);
    expect(payload).not.toHaveProperty('phoneNumber');
    expect(payload.whatsappNumber).toBe('66001122');
  });

  it('clears a number that an edit turned off', () => {
    useListingStore.getState().populateFromProperty({
      type: 'SALE',
      category: 'HOUSE',
      phoneNumber: '58094586',
      whatsappNumber: '66001122',
    } as unknown as Parameters<
      ReturnType<typeof useListingStore.getState>['populateFromProperty']
    >[0]);
    expect(useListingStore.getState().showWhatsapp).toBe(true);

    useListingStore.getState().updateField('showWhatsapp', false);
    const payload = useListingStore.getState().buildApiPayload(false, []);

    expect(payload.phoneNumber).toBe('58094586');
    expect(payload.whatsappNumber).toBeNull();
  });

  it('saves the allocation status of an exchange ad', () => {
    const { updateField, setListingType } = useListingStore.getState();
    setListingType('exchange');
    updateField('allocationState', 'مخصصة');

    expect(
      useListingStore.getState().buildApiPayload(false, []).allocationStatus,
    ).toBe('مخصصة');
  });
});

describe('isListingFormValid', () => {
  beforeEach(() => {
    useListingStore.getState().resetForm();
  });

  const fillBase = (categoryId: string) => {
    const { updateField } = useListingStore.getState();
    updateField('governorate', { id: 'g', label: 'العاصمة' });
    updateField('area', { id: 'a', label: 'الدسمة' });
    updateField('propertyCategory', { id: categoryId, label: categoryId });
    updateField('areaSize', '300');
    updateField('adDetails', 'تفاصيل');
    updateField('automatedNumber', '768954093');
    updateField('phoneNumber', '58094586');
    updateField('price', '150000');
  };
  const valid = () => isListingFormValid(useListingStore.getState());

  it('needs the property age for a house but not for land', () => {
    fillBase('house');
    expect(valid()).toBe(false);
    useListingStore.getState().updateField('propertyAge', '5');
    expect(valid()).toBe(true);

    useListingStore.getState().resetForm();
    fillBase('land');
    expect(valid()).toBe(true);
  });

  it('needs a number only for a contact toggle that is on', () => {
    fillBase('land');
    const { updateField } = useListingStore.getState();

    updateField('showWhatsapp', true);
    expect(valid()).toBe(false);
    updateField('whatsappNumber', '66001122');
    expect(valid()).toBe(true);

    updateField('phoneNumber', '');
    expect(valid()).toBe(false);
    updateField('showPhone', false);
    expect(valid()).toBe(true);
  });

  it('needs both years on an exchange ad', () => {
    fillBase('land');
    const { updateField, setListingType } = useListingStore.getState();
    setListingType('exchange');
    updateField('showPrice', false);
    expect(valid()).toBe(false);

    updateField('requestYear', '2019');
    updateField('requiredYear', '2025');
    expect(valid()).toBe(true);
  });
});
