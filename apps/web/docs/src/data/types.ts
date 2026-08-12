export interface FigmaFrameRef {
  url: string;
  /** Short label distinguishing this frame when a story cites more than one (e.g. which entry point or state it shows). */
  label?: string;
}

export interface UserStory {
  id: string;
  title: string;
  story: string;
  priority: "P0" | "P1" | "P2";
  acceptanceCriteria: string[];
  testScenarios: string[];
  /** Deep links to the specific Figma frame(s) for this story's flow. Omit until real frame links are available. A story can cite more than one frame (e.g. the same component reached from two entry points). */
  figmaFrameUrls?: FigmaFrameRef[];
  /** Classic product/UX persona story ("As an individual user, I want X so that Y") this QA story verifies. Optional — most stories only need the QA-facing `story` field. */
  endUserStory?: string;
}

export interface DocSection {
  slug: string;
  title: string;
  summary: string;
  stories: UserStory[];
}
