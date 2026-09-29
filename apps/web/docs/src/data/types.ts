export type Lang = "en" | "ar";

export type Localized<T> = { en: T; ar: T };

export function t<T>(value: Localized<T>, lang: Lang): T {
  return value[lang];
}

export interface FigmaFrameRef {
  url: string;
  /** Short label distinguishing this frame when a story cites more than one (e.g. which entry point or state it shows). */
  label?: Localized<string>;
}

export interface UserStory {
  id: string;
  title: Localized<string>;
  story: Localized<string>;
  priority: "P0" | "P1" | "P2";
  acceptanceCriteria: Localized<string[]>;
  testScenarios: Localized<string[]>;
  /** Deep links to the specific Figma frame(s) for this story's flow. Omit until real frame links are available. A story can cite more than one frame (e.g. the same component reached from two entry points). */
  figmaFrameUrls?: FigmaFrameRef[];
  /** Classic product/UX persona story ("As an individual user, I want X so that Y") this QA story verifies. Optional — most stories only need the QA-facing `story` field. */
  endUserStory?: Localized<string>;
  /** The branch/PR that last changed this story, so readers can tell how current it is. Set on every edit (see docs/ai/context.md). */
  updatedIn?: string;
}

export interface DocSection {
  slug: string;
  title: Localized<string>;
  summary: Localized<string>;
  stories: UserStory[];
}
