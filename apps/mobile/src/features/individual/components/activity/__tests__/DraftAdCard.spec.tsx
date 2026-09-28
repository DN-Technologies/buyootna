import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import DraftAdCard from '../DraftAdCard';
import { IMAGE_URLS, makeActivityItem, renderedImages } from './draftFixture';

jest.mock('expo-image', () => require('./draftFixture').mockExpoImage());

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
  it('shows the first uploaded image as a full-size thumbnail', async () => {
    await renderCard(IMAGE_URLS);
    const [image] = renderedImages;

    expect(image.source).toEqual({ uri: IMAGE_URLS[0] });
    // expo-image ignores NativeWind className; without an explicit style it
    // renders at 0x0 and the card looks empty
    expect(StyleSheet.flatten(image.style)).toMatchObject({
      width: '100%',
      height: '100%',
    });
  });

  it('falls back to the placeholder when the draft has no images', async () => {
    await renderCard([]);
    const [{ source }] = renderedImages;

    expect(source).not.toHaveProperty('uri');
    expect(source).toBeTruthy();
  });
});
