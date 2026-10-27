import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// A story is a full-screen vertical frame, as on Instagram
export const STORY_ASPECT = 9 / 16;

// Close enough to 9:16 to be shown edge to edge / left uncropped
const FRAME_TOLERANCE = 0.06;
const CROP_TOLERANCE = 0.02;

export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

/**
 * The centred 9:16 part of a photo, or null when it's already 9:16. A
 * wider photo loses its sides, a taller one its top and bottom -- what the
 * full-screen camera preview showed.
 */
export function storyCropRect(width: number, height: number): CropRect | null {
  if (!width || !height) return null;
  const aspect = width / height;
  if (Math.abs(aspect - STORY_ASPECT) <= CROP_TOLERANCE) return null;
  if (aspect > STORY_ASPECT) {
    const cropWidth = Math.round(height * STORY_ASPECT);
    return {
      originX: Math.round((width - cropWidth) / 2),
      originY: 0,
      width: cropWidth,
      height,
    };
  }
  const cropHeight = Math.round(width / STORY_ASPECT);
  return {
    originX: 0,
    originY: Math.round((height - cropHeight) / 2),
    width,
    height: cropHeight,
  };
}

/** The camera's photo as a 9:16 JPEG (untouched when it already is). */
export async function cropToStoryFrame(
  uri: string,
  width: number,
  height: number,
): Promise<{ uri: string; width: number; height: number }> {
  const rect = storyCropRect(width, height);
  if (!rect) return { uri, width, height };
  const context = ImageManipulator.manipulate(uri);
  context.crop(rect);
  const image = await context.renderAsync();
  const saved = await image.saveAsync({
    compress: 0.85,
    format: SaveFormat.JPEG,
  });
  return { uri: saved.uri, width: saved.width, height: saved.height };
}

/**
 * How the viewer shows a story: a 9:16 one fills the screen edge to edge
 * (a tall phone crops a sliver), any other shape fits inside.
 */
export function storyFit(
  width: number | null | undefined,
  height: number | null | undefined,
): 'cover' | 'contain' {
  if (!width || !height) return 'contain';
  return Math.abs(width / height - STORY_ASPECT) < FRAME_TOLERANCE
    ? 'cover'
    : 'contain';
}
