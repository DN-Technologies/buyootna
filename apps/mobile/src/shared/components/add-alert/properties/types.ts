import type { AlertPropertiesState } from './constants';

/** Field setter shared by the properties tab and its sections. */
export type AlertPropertiesChange = <K extends keyof AlertPropertiesState>(
  field: K,
  value: AlertPropertiesState[K],
) => void;
