export interface UserStory {
  id: string;
  title: string;
  story: string;
  priority: "P0" | "P1" | "P2";
  acceptanceCriteria: string[];
  testScenarios: string[];
}

export interface DocSection {
  slug: string;
  title: string;
  summary: string;
  stories: UserStory[];
}
