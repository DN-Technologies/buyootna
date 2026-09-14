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
