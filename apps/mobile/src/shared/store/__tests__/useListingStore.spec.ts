import { useListingStore } from '../useListingStore';

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
