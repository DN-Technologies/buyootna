import { render } from '@testing-library/react-native';

import DraftPreviewSheet from '../DraftPreviewSheet';
import { IMAGE_URLS, makeActivityItem, renderedImages } from './draftFixture';

jest.mock('expo-image', () => require('./draftFixture').mockExpoImage());

beforeEach(() => {
  renderedImages.length = 0;
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const MockBottomSheetModal = React.forwardRef(
    function MockBottomSheetModal(
      { children }: { children: React.ReactNode },
      _ref: any,
    ) {
      return <>{children}</>;
    },
  );
  MockBottomSheetModal.displayName = 'BottomSheetModal';

  return {
    BottomSheetModal: MockBottomSheetModal,
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    BottomSheetBackdrop: () => null,
  };
});

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

describe('DraftPreviewSheet', () => {
  it('shows every uploaded image, in order', async () => {
    await render(
      <DraftPreviewSheet property={makeActivityItem()} />,
    );

    expect(renderedImages.map((i) => i.source)).toEqual(
      IMAGE_URLS.map((uri) => ({ uri })),
    );
  });

  it('falls back to the placeholder when the draft has no images', async () => {
    await render(
      <DraftPreviewSheet property={makeActivityItem({ images: [] })} />,
    );
    const images = renderedImages;

    expect(images).toHaveLength(1);
    expect(images[0].source).not.toHaveProperty('uri');
  });
});
