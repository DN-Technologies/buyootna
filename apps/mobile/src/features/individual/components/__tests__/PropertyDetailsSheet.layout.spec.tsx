// QA: a long ad didn't scroll in its details sheet; the rest of the
// description and «عرض العقار» were cut off. The sheet was sized to its
// content (a BottomSheetView around the scroll view, v5's dynamic sizing),
// so the scroll view was as tall as everything in it.
import { render } from '@testing-library/react-native';

import PropertyDetailsSheet from '../PropertyDetailsSheet';

const mockModalProps: Record<string, unknown>[] = [];
jest.mock('@gorhom/bottom-sheet', () => {
  const { forwardRef } = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    BottomSheetModal: forwardRef((props: any, _ref: unknown) => {
      mockModalProps.push(props);
      return <View testID="modal">{props.children}</View>;
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetScrollView: ({ children }: any) => (
      <View testID="sheet-scroll">{children}</View>
    ),
    BottomSheetView: ({ children }: any) => (
      <View testID="measured-view">{children}</View>
    ),
  };
});

jest.mock(
  '@/features/individual/components/property-details-sheet/PropertyImageCarousel',
  () => () => null,
);
jest.mock(
  '@/features/individual/components/property-details-sheet/PropertyPriceViewsRow',
  () => () => null,
);
jest.mock(
  '@/features/individual/components/property-details-sheet/PropertySpecsRow',
  () => () => null,
);
jest.mock(
  '@/features/individual/components/property-details-sheet/PropertyAdditionalDetails',
  () => () => null,
);
jest.mock(
  '@/features/individual/components/property-details-sheet/PropertyContactActionsBar',
  () => () => null,
);
jest.mock(
  '@/features/individual/components/property-details-sheet/PropertyDetailsSheetHeader',
  () => () => null,
);
jest.mock(
  '@/features/individual/components/property-details-sheet/PropertyDescriptionSection',
  () =>
    function Description({ description }: { description: string }) {
      const { Text: T } = jest.requireActual('react-native');
      return <T>{description}</T>;
    },
);
jest.mock(
  '@/features/individual/components/property-details-sheet/usePropertyContactActions',
  () => ({
    usePropertyContactActions: () => ({
      canWhatsApp: false,
      handleWhatsApp: jest.fn(),
      handleCall: jest.fn(),
      handleChat: jest.fn(),
    }),
  }),
);

const longDescription = 'وصف طويل جداً '.repeat(400);
const property = {
  id: 'p1',
  category: 'RENT',
  type: 'APARTMENT',
  images: [],
  price: 500,
  createdAt: '2026-11-01T00:00:00.000Z',
  views: 3,
  description: longDescription,
} as never;

describe('PropertyDetailsSheet layout', () => {
  beforeEach(() => {
    mockModalProps.length = 0;
  });

  it('is a fixed 85% sheet, not sized to the ad', async () => {
    await render(<PropertyDetailsSheet property={property} />);
    const props = mockModalProps.at(-1)!;
    expect(props.enableDynamicSizing).toBe(false);
    expect(props.snapPoints).toEqual(['85%']);
  });

  it('scrolls the whole ad, the description and «عرض العقار» included', async () => {
    const screen = await render(<PropertyDetailsSheet property={property} />);

    // Nothing measures the content for the sheet's height
    expect(screen.queryByTestId('measured-view')).toBeNull();
    const scroll = screen.getByTestId('sheet-scroll');
    expect(scroll).toContainElement(screen.getByText(longDescription));
    expect(scroll).toContainElement(screen.getByText('عرض العقار'));
  });
});
