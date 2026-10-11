import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import { IMAGE_URLS, makeActivityItem, renderedImages } from '../../__tests__/draftFixture';
import AdPreviewSheet from '../AdPreviewSheet';

jest.mock('expo-image', () => require('../../__tests__/draftFixture').mockExpoImage());

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

describe('AdPreviewSheet', () => {
  it('shows every uploaded image, in order', async () => {
    await render(
      <AdPreviewSheet property={makeActivityItem()} />,
    );

    expect(renderedImages.map((i) => i.source)).toEqual(
      IMAGE_URLS.map((uri) => ({ uri })),
    );
  });

  it('falls back to the placeholder when the draft has no images', async () => {
    await render(
      <AdPreviewSheet property={makeActivityItem({ images: [] })} />,
    );
    const images = renderedImages;

    expect(images).toHaveLength(1);
    expect(images[0].source).not.toHaveProperty('uri');
  });

  describe('active variant', () => {
    const renderActive = async (extra = {}) => {
      const ref = createRef<any>();
      ref.current = { dismiss: jest.fn() };
      const props = {
        onToggleVisibility: jest.fn(),
        onFeaturePress: jest.fn(),
        onDeletePress: jest.fn(),
        ...extra,
      };
      const utils = await render(
        <AdPreviewSheet
          ref={ref}
          variant="active"
          property={makeActivityItem({ id: 'ad-9', isHidden: false } as any)}
          {...props}
        />,
      );
      return { ...utils, props, ref };
    };

    it('shows the real publish date, not a placeholder', async () => {
      const { queryByText } = await renderActive();
      expect(queryByText(/15 مايو 2026/)).toBeNull();
    });

    it('feature closes the sheet and opens the feature flow for this ad', async () => {
      const { getByText, props, ref } = await renderActive();
      await fireEvent.press(getByText('تمييز'));
      expect(ref.current.dismiss).toHaveBeenCalled();
      expect(props.onFeaturePress).toHaveBeenCalledWith('ad-9');
    });

    it('delete closes the sheet and asks to delete', async () => {
      const { getByText, props, ref } = await renderActive();
      await fireEvent.press(getByText('حذف'));
      expect(ref.current.dismiss).toHaveBeenCalled();
      expect(props.onDeletePress).toHaveBeenCalled();
    });
  });
});
