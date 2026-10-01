import { act, fireEvent, render } from '@testing-library/react-native';

import MapPreview, { staticMapUrl } from '../MapPreview';

// The preview is a cached static image, not a live map that refetched its
// tiles on every visit to an ad

const renderedImages: { source: { uri: string }; cachePolicy?: string; onError?: () => void }[] =
  [];
jest.mock('expo-image', () => ({
  Image: (props: any) => {
    renderedImages.push(props);
    const { View } = jest.requireActual('react-native');
    return <View testID={props.testID} />;
  },
}));

beforeEach(() => {
  renderedImages.length = 0;
});

describe('staticMapUrl', () => {
  it('builds a stable, size-capped Mapbox static image URL', () => {
    const url = staticMapUrl(29.337001234, 47.978004321, 2000);

    expect(url).toContain(
      '/styles/v1/mapbox/light-v11/static/pin-s+15304d(47.97800,29.33700)/47.97800,29.33700,13.5,0/1280x160@2x',
    );
    expect(url).toContain('access_token=pk.');
    // Same place, same URL: the image cache hits on the next visit
    expect(staticMapUrl(29.3370012, 47.9780041, 2000)).toBe(url);
  });
});

describe('MapPreview', () => {
  it('shows the cached static map for an ad with coordinates', async () => {
    const { getByTestId } = await render(
      <MapPreview location="الفيحاء" latitude={29.337} longitude={47.978} />,
    );

    expect(getByTestId('map-preview-image')).toBeTruthy();
    const [image] = renderedImages;
    expect(image.cachePolicy).toBe('memory-disk');
    expect(image.source.uri).toContain('47.97800,29.33700,13.5');
  });

  it('falls back to the generic picture when the map image fails', async () => {
    const { queryByTestId } = await render(
      <MapPreview location="الفيحاء" latitude={29.337} longitude={47.978} />,
    );

    await act(async () => {
      renderedImages[0].onError?.();
    });

    expect(queryByTestId('map-preview-image')).toBeNull();
  });

  it('uses the generic picture when the ad has no coordinates', async () => {
    const { queryByTestId } = await render(<MapPreview location="الكويت" />);

    expect(queryByTestId('map-preview-image')).toBeNull();
  });

  it('still runs its press action', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <MapPreview
        location="الفيحاء"
        latitude={29.337}
        longitude={47.978}
        onPress={onPress}
      />,
    );

    await act(async () => {
      fireEvent.press(getByText('الموقع على الخريطة'));
    });

    expect(onPress).toHaveBeenCalled();
  });
});
