// Native gesture-handler module stand-ins for Jest
import 'react-native-gesture-handler/jestSetup';

import { fireEvent, render } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';

import ImageViewer, { useImageViewer } from '../ImageViewer';

// The gesture/zoom layer needs native Reanimated; its maths is covered in
// zoom.spec.ts. Here each photo is a plain element.
const mockPhotoMounts = { count: 0 };
jest.mock('../ZoomableImage', () => {
  const { Text: RNText } = jest.requireActual('react-native');
  const { useEffect } = jest.requireActual('react');
  return function MockZoomableImage({ uri }: { uri: string }) {
    useEffect(() => {
      mockPhotoMounts.count += 1;
    }, []);
    return <RNText testID="zoomable-photo">{uri}</RNText>;
  };
});

const images = ['https://cdn/a.jpg', 'https://cdn/b.jpg', 'https://cdn/c.jpg'];

describe('ImageViewer', () => {
  beforeEach(() => {
    mockPhotoMounts.count = 0;
  });

  it('shows every photo with an "n / total" counter from the tapped one', async () => {
    const { getAllByTestId, getByTestId } = await render(
      <ImageViewer images={images} initialIndex={1} visible onClose={jest.fn()} />,
    );

    expect(getAllByTestId('zoomable-photo').length).toBeGreaterThan(0);
    expect(getByTestId('image-viewer-counter').props.children).toBe('2 / 3');
  });

  // QA (iOS): opened black until the page was drawn again by a swipe
  it('draws the photos afresh once the modal is fully on screen', async () => {
    const { getByTestId, getAllByTestId } = await render(
      <ImageViewer images={images} initialIndex={0} visible onClose={jest.fn()} />,
    );
    const firstDraw = mockPhotoMounts.count;
    expect(firstDraw).toBeGreaterThan(0);

    await fireEvent(getByTestId('image-viewer-modal'), 'show');

    expect(mockPhotoMounts.count).toBe(firstDraw * 2);
    expect(getAllByTestId('zoomable-photo').length).toBeGreaterThan(0);
    expect(getByTestId('image-viewer-counter').props.children).toBe('1 / 3');
  });

  it('closes with ✕', async () => {
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <ImageViewer images={images} initialIndex={0} visible onClose={onClose} />,
    );

    await fireEvent.press(getByTestId('image-viewer-close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('has no counter for a single photo, and renders nothing when hidden', async () => {
    const single = await render(
      <ImageViewer images={[images[0]]} initialIndex={0} visible onClose={jest.fn()} />,
    );
    expect(single.queryByTestId('image-viewer-counter')).toBeNull();

    const hidden = await render(
      <ImageViewer images={images} initialIndex={0} visible={false} onClose={jest.fn()} />,
    );
    expect(hidden.queryByTestId('image-viewer')).toBeNull();
  });
});

describe('useImageViewer', () => {
  function Harness({ items, at }: { items: (string | number)[]; at: number }) {
    const { open, viewer, isOpen } = useImageViewer();
    return (
      <>
        <TouchableOpacity testID="open" onPress={() => open(items, at)}>
          <Text>open</Text>
        </TouchableOpacity>
        <Text testID="state">{isOpen ? 'open' : 'closed'}</Text>
        {viewer}
      </>
    );
  }

  it('opens at the tapped photo', async () => {
    const { getByTestId } = await render(<Harness items={images} at={2} />);

    await fireEvent.press(getByTestId('open'));

    expect(getByTestId('state').props.children).toBe('open');
    expect(getByTestId('image-viewer-counter').props.children).toBe('3 / 3');
  });

  it('does nothing for a placeholder with no real photo', async () => {
    const { getByTestId } = await render(<Harness items={[42]} at={0} />);

    await fireEvent.press(getByTestId('open'));

    expect(getByTestId('state').props.children).toBe('closed');
  });
});
