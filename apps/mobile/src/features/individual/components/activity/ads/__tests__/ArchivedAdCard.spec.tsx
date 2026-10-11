import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { IMAGE_URLS, makeActivityItem, renderedImages } from '../../__tests__/draftFixture';
import ArchivedAdCard from '../ArchivedAdCard';

jest.mock('expo-image', () => require('../../__tests__/draftFixture').mockExpoImage());

beforeEach(() => {
  renderedImages.length = 0;
});

describe('ArchivedAdCard', () => {
  it('shows the first image as a full-size thumbnail', async () => {
    await render(
      <ArchivedAdCard property={makeActivityItem({ status: 'EXPIRED' as any })} />,
    );
    const [image] = renderedImages;

    expect(image.source).toEqual({ uri: IMAGE_URLS[0] });
    expect(StyleSheet.flatten(image.style)).toMatchObject({
      width: '100%',
      height: '100%',
    });
  });
});
