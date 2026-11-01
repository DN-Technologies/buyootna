import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { IMAGE_URLS, makeActivityItem, renderedImages } from '../../__tests__/draftFixture';
import DraftAdCard from '../DraftAdCard';

jest.mock('expo-image', () => require('../../__tests__/draftFixture').mockExpoImage());

beforeEach(() => {
  renderedImages.length = 0;
});

const renderCard = (images: string[]) =>
  render(
    <DraftAdCard
      property={makeActivityItem({ images })}
      onPublishPress={jest.fn()}
      onDeletePress={jest.fn()}
    />,
  );

describe('DraftAdCard', () => {
  it('shows every uploaded photo, each the width of the card', async () => {
    const { getByTestId } = await renderCard(IMAGE_URLS);
    await act(async () => {
      fireEvent(getByTestId('ad-image-gallery'), 'layout', {
        nativeEvent: { layout: { width: 320, height: 210 } },
      });
    });
    const shown = renderedImages.slice(-IMAGE_URLS.length);

    expect(shown.map((image) => image.source)).toEqual(
      IMAGE_URLS.map((uri) => ({ uri })),
    );
    // expo-image ignores NativeWind className; without an explicit style it
    // renders at 0x0 and the card looks empty
    shown.forEach((image) =>
      expect(StyleSheet.flatten(image.style)).toMatchObject({
        width: 320,
        height: '100%',
      }),
    );
  });

  it('the photos page by swiping', async () => {
    const { getByTestId } = await renderCard(IMAGE_URLS);
    const scroll = getByTestId('ad-image-gallery-scroll');

    expect(scroll.props.horizontal).toBe(true);
    expect(scroll.props.pagingEnabled).toBe(true);
    expect(scroll.props.scrollEnabled).toBe(IMAGE_URLS.length > 1);
  });

  it('falls back to the placeholder when the draft has no images', async () => {
    await renderCard([]);
    const [{ source }] = renderedImages;

    expect(source).not.toHaveProperty('uri');
    expect(source).toBeTruthy();
  });
});
