import { ImageManipulator } from 'expo-image-manipulator';

import {
  cropToStoryFrame,
  storyCropRect,
  storyFit,
} from '../storyFrame';

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg' },
}));

describe('storyCropRect', () => {
  it('leaves a 9:16 photo as it is', () => {
    expect(storyCropRect(1080, 1920)).toBeNull();
    expect(storyCropRect(720, 1280)).toBeNull();
  });

  it('takes the centred 9:16 of a wider (4:3 portrait) photo', () => {
    // 3024 x 4032: 9:16 of 4032 high is 2268 wide
    expect(storyCropRect(3024, 4032)).toEqual({
      originX: 378,
      originY: 0,
      width: 2268,
      height: 4032,
    });
  });

  it('takes the centred 9:16 of a taller photo', () => {
    expect(storyCropRect(900, 2000)).toEqual({
      originX: 0,
      originY: 200,
      width: 900,
      height: 1600,
    });
  });

  it('ignores a missing size', () => {
    expect(storyCropRect(0, 0)).toBeNull();
  });
});

describe('storyFit', () => {
  it('fills the screen with a 9:16 story', () => {
    expect(storyFit(1080, 1920)).toBe('cover');
    expect(storyFit(720, 1280)).toBe('cover');
  });

  it('fits any other shape inside', () => {
    expect(storyFit(1200, 900)).toBe('contain'); // 4:3
    expect(storyFit(1000, 1000)).toBe('contain'); // 1:1
    expect(storyFit(1920, 1080)).toBe('contain'); // 16:9
    expect(storyFit(null, null)).toBe('contain'); // not known yet
  });
});

describe('cropToStoryFrame', () => {
  it('returns a 9:16 photo untouched', async () => {
    await expect(cropToStoryFrame('file:///a.jpg', 1080, 1920)).resolves.toEqual({
      uri: 'file:///a.jpg',
      width: 1080,
      height: 1920,
    });
    expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
  });

  it('crops any other photo and saves it as a JPEG', async () => {
    const saveAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file:///cropped.jpg', width: 2268, height: 4032 });
    const context = {
      crop: jest.fn(),
      renderAsync: jest.fn().mockResolvedValue({ saveAsync }),
    };
    (ImageManipulator.manipulate as jest.Mock).mockReturnValue(context);

    await expect(cropToStoryFrame('file:///b.jpg', 3024, 4032)).resolves.toEqual({
      uri: 'file:///cropped.jpg',
      width: 2268,
      height: 4032,
    });
    expect(context.crop).toHaveBeenCalledWith({
      originX: 378,
      originY: 0,
      width: 2268,
      height: 4032,
    });
    expect(saveAsync).toHaveBeenCalledWith({ compress: 0.85, format: 'jpeg' });
  });
});
