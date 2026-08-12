export interface UserStory {
  id: string;
  title: string;
  story: string;
  priority: "P0" | "P1" | "P2";
  acceptanceCriteria: string[];
  testScenarios: string[];
  /** Deep link to the specific Figma frame for this story's flow. Omit until a real frame link is available. */
  figmaFrameUrl?: string;
  /** Classic product/UX persona story ("As an individual user, I want X so that Y") this QA story verifies. Optional — most stories only need the QA-facing `story` field. */
  endUserStory?: string;
}

export interface DocSection {
  slug: string;
  title: string;
  summary: string;
  stories: UserStory[];
}
