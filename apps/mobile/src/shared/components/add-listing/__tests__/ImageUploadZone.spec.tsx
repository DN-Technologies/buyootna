// QA [Critical]: «إضافة إعلان»'s photos showed «نحتاج إلى إذن …» with no way
// on once iOS's one-time prompt was refused. The system photo picker needs
// no permission (iOS 11+, Android), so the zone opens it straight away.
import { act, fireEvent, render } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { useListingStore } from '@/shared/store/useListingStore';
import { showAlert } from '@/shared/utils/alert';

import ImageUploadZone from '../ImageUploadZone';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/shared/hooks/properties/useAdImageLimit', () => ({
  useAdImageLimit: () => 5,
}));

describe('ImageUploadZone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useListingStore.setState({ images: [], adLevel: 'normal' } as never);
  });

  it('opens the photo picker without asking for a permission, and adds the photos', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///1.jpg' }, { uri: 'file:///2.jpg' }],
    });
    const screen = await render(<ImageUploadZone />);

    await act(async () => fireEvent.press(screen.getByTestId('image-dropzone')));

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsMultipleSelection: true, selectionLimit: 5 }),
    );
    expect(showAlert).not.toHaveBeenCalled();
    expect(useListingStore.getState().images).toEqual([
      'file:///1.jpg',
      'file:///2.jpg',
    ]);
  });

  it('a cancelled picker adds nothing and says nothing', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: null,
    });
    const screen = await render(<ImageUploadZone />);

    await act(async () => fireEvent.press(screen.getByTestId('image-dropzone')));

    expect(useListingStore.getState().images).toEqual([]);
    expect(showAlert).not.toHaveBeenCalled();
  });
});
