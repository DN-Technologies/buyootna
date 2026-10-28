// The composer's controls over the photo or video (Figma's glass): white
// outline and content on a dark see-through fill, so they stay readable on
// a light photo or a screenshot too (on 10% white they disappeared, QA)
export const STORY_GLASS = {
  borderWidth: 0.83,
  borderColor: 'rgba(255,255,255,0.8)',
  backgroundColor: 'rgba(17,17,17,0.45)',
} as const;

// Behind the top controls and the bottom bar, as in the story viewer
export const STORY_SCRIM = 'rgba(0,0,0,0.55)';
