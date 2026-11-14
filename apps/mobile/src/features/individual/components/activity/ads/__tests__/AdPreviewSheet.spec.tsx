import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import { IMAGE_URLS, makeActivityItem, renderedImages } from '../../__tests__/draftFixture';
import AdPreviewSheet from '../AdPreviewSheet';

jest.mock('expo-image', () => require('../../__tests__/draftFixture').mockExpoImage());

beforeEach(() => {
  renderedImages.length = 0;
});

// The sheet's props, as last rendered
let mockSheetProps: Record<string, unknown> = {};
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const MockBottomSheetModal = React.forwardRef(
    function MockBottomSheetModal(
      { children, ...props }: { children: React.ReactNode },
      _ref: any,
    ) {
      mockSheetProps = props;
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
  // QA: dragging up slid the sheet under the status bar and Dynamic Island
  it('stops at 85%, below the status bar, however far it is dragged', async () => {
    await render(<AdPreviewSheet property={makeActivityItem()} />);

    expect(mockSheetProps).toMatchObject({
      snapPoints: ['85%'],
      enableDynamicSizing: false,
      enableOverDrag: false,
    });
    expect(typeof mockSheetProps.topInset).toBe('number');
  });

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

    // QA: «تمييز» stayed on an ad that was already featured
    it('a featured ad shows until when instead of «تمييز»', async () => {
      const until = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
      const ref = createRef<any>();
      ref.current = { dismiss: jest.fn() };
      const onFeaturePress = jest.fn();
      const { queryByText, getByTestId, queryByTestId } = await render(
        <AdPreviewSheet
          ref={ref}
          variant="active"
          property={makeActivityItem({
            id: 'ad-9',
            isHidden: false,
            isPremium: true,
            featuredUntil: until,
          } as any)}
          onFeaturePress={onFeaturePress}
          onDeletePress={jest.fn()}
          onToggleVisibility={jest.fn()}
        />,
      );

      expect(queryByText('تمييز')).toBeNull();
      expect(queryByTestId('ad-preview-feature')).toBeNull();
      expect(getByTestId('ad-preview-featured')).toHaveTextContent(/^مميز حتى /);
      await fireEvent.press(getByTestId('ad-preview-featured'));
      expect(onFeaturePress).not.toHaveBeenCalled();
    });

    it('delete closes the sheet and asks to delete', async () => {
      const { getByText, props, ref } = await renderActive();
      await fireEvent.press(getByText('حذف'));
      expect(ref.current.dismiss).toHaveBeenCalled();
      expect(props.onDeletePress).toHaveBeenCalled();
    });
  });
});
