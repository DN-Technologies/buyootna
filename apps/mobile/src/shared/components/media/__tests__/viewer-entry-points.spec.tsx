import 'react-native-gesture-handler/jestSetup';

import { fireEvent, render } from '@testing-library/react-native';

import PropertyImageCarousel from '@/features/individual/components/property-details-sheet/PropertyImageCarousel';
import CompanyGalleryTab from '@/shared/components/company/CompanyGalleryTab';
import PropertyMediaHeader from '@/shared/components/property/PropertyMediaHeader';

jest.mock('../ZoomableImage', () => {
  const { Text } = jest.requireActual('react-native');
  return function MockZoomableImage({ uri }: { uri: string }) {
    return <Text testID="zoomable-photo">{uri}</Text>;
  };
});

const insets = { top: 0, bottom: 0, left: 0, right: 0 };
const photos = ['https://cdn/1.jpg', 'https://cdn/2.jpg', 'https://cdn/3.jpg'];

describe('tapping a photo opens the full-screen viewer', () => {
  it('ad page: at the tapped photo', async () => {
    const { getByTestId, queryByTestId } = await render(
      <PropertyMediaHeader images={photos} insets={insets} onBack={jest.fn()} />,
    );
    expect(queryByTestId('image-viewer')).toBeNull();

    await fireEvent.press(getByTestId('property-media-photo-1'));

    expect(getByTestId('image-viewer')).toBeTruthy();
    expect(getByTestId('image-viewer-counter').props.children).toBe('2 / 3');
  });

  it('ad details sheet: at the tapped photo; the placeholder does nothing', async () => {
    const { getByTestId } = await render(
      <PropertyImageCarousel images={photos} isFeatured={false} />,
    );
    await fireEvent.press(getByTestId('sheet-photo-2'));
    expect(getByTestId('image-viewer-counter').props.children).toBe('3 / 3');

    const placeholder = await render(
      <PropertyImageCarousel images={[1]} isFeatured={false} />,
    );
    await fireEvent.press(placeholder.getByTestId('sheet-photo-0'));
    expect(placeholder.queryByTestId('image-viewer')).toBeNull();
  });

  it("company gallery: a project's own photos", async () => {
    const { getByTestId } = await render(
      <CompanyGalleryTab
        projects={[
          {
            id: 'p1',
            title: 'فيلا',
            imageUrl: 'https://cdn/p1-a.jpg',
            images: ['https://cdn/p1-a.jpg', 'https://cdn/p1-b.jpg'],
          },
        ]}
      />,
    );

    await fireEvent.press(getByTestId('company-project-photo-p1'));

    expect(getByTestId('image-viewer-counter').props.children).toBe('1 / 2');
  });

  it('company gallery: no stock photos when there are no projects', async () => {
    const { getByTestId, queryByText } = await render(<CompanyGalleryTab />);

    expect(getByTestId('company-gallery-empty')).toBeTruthy();
    expect(queryByText('تصميم واجهة قسيمة في خيران')).toBeNull();
  });
});
