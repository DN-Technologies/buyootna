// How long a photo story shows
export const STORY_IMAGE_MS = 5000;
// A video whose length the server didn't record (it always should)
export const STORY_VIDEO_FALLBACK_MS = 15_000;
// Links this close to expiring are renewed before the story is shown
export const STORY_LINK_MARGIN_MS = 30_000;
// A story counts as viewed after this long on screen (a video: played)
export const STORY_VIEW_AFTER_MS = 1000;
