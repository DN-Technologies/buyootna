import "server-only";
import { sections } from "@/data/sections";
import type { Localized } from "@/data/types";
import { canSeeSection, type DocsRole } from "./access";

/** What the sidebar and home page need about a section -- no story content. */
export interface NavSection {
  slug: string;
  title: Localized<string>;
  summary: Localized<string>;
  storyCount: number;
}

/**
 * The sections this role may open. Built on the server so the story data
 * of hidden sections never reaches that role's browser.
 */
export function navSectionsFor(role: DocsRole): NavSection[] {
  return sections
    .filter((section) => canSeeSection(role, section.slug))
    .map((section) => ({
      slug: section.slug,
      title: section.title,
      summary: section.summary,
      storyCount: section.stories.length,
    }));
}
