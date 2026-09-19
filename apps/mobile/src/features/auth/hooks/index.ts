export {
  type BusinessAuthMode,
  COMPANY_OFFICE_LOCKED,
  useBusinessAuth,
} from './useBusinessAuth';
export {
  type IndividualAuthMode,
  useIndividualAuth,
} from './useIndividualAuth';
export * from './useSocialAuth';
export type AuthMode = 'login' | 'signup';
