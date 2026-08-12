import { mobile } from "./mobile";
import { admin } from "./admin";
import { companies } from "./companies";
import { offices } from "./offices";
import { management } from "./management";
import { landing } from "./landing";
import { api } from "./api";
import { DocSection } from "./types";

export const sections: DocSection[] = [
  mobile,
  admin,
  companies,
  offices,
  management,
  landing,
  api,
];

export function getSection(slug: string): DocSection | undefined {
  return sections.find((section) => section.slug === slug);
}
