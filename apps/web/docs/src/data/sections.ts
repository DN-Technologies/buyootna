import { mobileShared } from "./mobileShared";
import { mobileIndividual } from "./mobileIndividual";
import { mobileCompany } from "./mobileCompany";
import { mobileOffice } from "./mobileOffice";
import { admin } from "./admin";
import { companies } from "./companies";
import { offices } from "./offices";
import { management } from "./management";
import { landing } from "./landing";
import { api } from "./api";
import { roadmap } from "./roadmap";
import { DocSection } from "./types";

export const sections: DocSection[] = [
  mobileShared,
  mobileIndividual,
  mobileCompany,
  mobileOffice,
  admin,
  companies,
  offices,
  management,
  landing,
  api,
  roadmap,
];

export function getSection(slug: string): DocSection | undefined {
  return sections.find((section) => section.slug === slug);
}
