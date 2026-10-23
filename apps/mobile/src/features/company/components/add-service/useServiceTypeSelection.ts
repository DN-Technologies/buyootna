import { useState } from 'react';

import type { MyCompanyService } from '@/shared/api/company.service';
import {
  ALL_TYPES,
  listedTypes,
  OTHER_TYPE,
  typesToSend,
} from '@/shared/data/serviceCatalog';

/**
 * Picking نوع الخدمة for a specialty: its listed types, "الكل" and "اخرى".
 * Types the company already offers are ticked and greyed, out of the
 * choice (Figma 8453:24047, 8455:25558). Shared by إضافة خدمة and اضافة
 * خدمة فرعية.
 */
export function useServiceTypeSelection(
  specialty: string,
  existing: MyCompanyService[],
) {
  // Types already added can't be added again; "اخرى" can, under a new title
  const takenTypes = existing
    .map((item) => item.type)
    .filter((type) => type !== OTHER_TYPE);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const typeOptions = specialty
    ? [ALL_TYPES, ...listedTypes(specialty), OTHER_TYPE]
    : [];
  // The listed types still free to add
  const freeTypes = listedTypes(specialty).filter(
    (type) => !takenTypes.includes(type),
  );
  // The rows shown ticked and greyed: the taken types, and "الكل" once
  // nothing it stands for is left (every listed type, or, for a specialty
  // with no list, the specialty itself)
  const allTaken =
    listedTypes(specialty).length > 0
      ? freeTypes.length === 0
      : !!specialty && takenTypes.includes(specialty);
  const disabledTypes = [...takenTypes, ...(allTaken ? [ALL_TYPES] : [])];
  const hasOther = selectedTypes.includes(OTHER_TYPE);
  const types = typesToSend(specialty, selectedTypes);

  const toggleType = (type: string) => {
    if (disabledTypes.includes(type)) return;
    setSelectedTypes((current) => {
      if (type === ALL_TYPES) {
        const others = current.filter((item) => item === OTHER_TYPE);
        return current.includes(ALL_TYPES)
          ? others
          : [ALL_TYPES, ...freeTypes, ...others];
      }
      const next = current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type];
      if (type === OTHER_TYPE) return next;
      // "الكل" follows the free listed types: on only while all of them are
      const allFree =
        freeTypes.length > 0 && freeTypes.every((item) => next.includes(item));
      const withoutAll = next.filter((item) => item !== ALL_TYPES);
      return allFree ? [ALL_TYPES, ...withoutAll] : withoutAll;
    });
  };

  // What the closed نوع الخدمة field reads
  const typesLabel = selectedTypes.includes(ALL_TYPES)
    ? [ALL_TYPES, ...(hasOther ? [OTHER_TYPE] : [])].join('، ')
    : selectedTypes.join('، ');

  return {
    typeOptions,
    selectedTypes,
    setSelectedTypes,
    disabledTypes,
    toggleType,
    typesLabel,
    hasOther,
    types,
  };
}
