import { cleanup, renderHook } from '@testing-library/react-native';

import { Identity, useAuthStore } from '@/shared/store/useAuthStore';

import { useIdentity } from '../useIdentity';

const buildIdentity = (overrides: Partial<Identity> = {}): Identity => ({
  id: 'identity-1',
  type: 'INDIVIDUAL',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const initialState = useAuthStore.getState();

describe('useIdentity', () => {
  afterEach(() => {
    cleanup();
    useAuthStore.setState(initialState, true);
  });

  describe('canCreateIdentity', () => {
    it('returns false for INDIVIDUAL when the user already has one', async () => {
      useAuthStore.setState({
        identities: [buildIdentity({ type: 'INDIVIDUAL' })],
      });
      const { result } = await renderHook(() => useIdentity());

      expect(result.current.canCreateIdentity('INDIVIDUAL')).toBe(false);
    });

    it('returns true for INDIVIDUAL when the user has none yet', async () => {
      useAuthStore.setState({ identities: [] });
      const { result } = await renderHook(() => useIdentity());

      expect(result.current.canCreateIdentity('INDIVIDUAL')).toBe(true);
    });

    it('is unlimited for COMPANY/OFFICE', async () => {
      useAuthStore.setState({
        identities: [
          buildIdentity({ id: 'c1', type: 'COMPANY' }),
          buildIdentity({ id: 'c2', type: 'COMPANY' }),
        ],
      });
      const { result } = await renderHook(() => useIdentity());

      expect(result.current.canCreateIdentity('COMPANY')).toBe(true);
      expect(result.current.canCreateIdentity('OFFICE')).toBe(true);
    });
  });

  describe('identityCounts / identitiesByType', () => {
    it('aggregates counts and groups identities per type', async () => {
      const individual = buildIdentity({ id: 'i1', type: 'INDIVIDUAL' });
      const company = buildIdentity({ id: 'c1', type: 'COMPANY' });
      useAuthStore.setState({ identities: [individual, company] });
      const { result } = await renderHook(() => useIdentity());

      expect(result.current.identityCounts).toEqual({
        individual: 1,
        company: 1,
        office: 0,
        total: 2,
      });
      expect(result.current.identitiesByType.INDIVIDUAL).toEqual([
        individual,
      ]);
      expect(result.current.identitiesByType.COMPANY).toEqual([company]);
      expect(result.current.identitiesByType.OFFICE).toEqual([]);
    });
  });

  describe('type checks and hasMultipleIdentities', () => {
    it('derives isIndividual/isCompany/isOffice/isBusiness from the active identity', async () => {
      useAuthStore.setState({
        activeIdentity: buildIdentity({ type: 'COMPANY' }),
        identities: [buildIdentity({ type: 'COMPANY' })],
      });
      const { result } = await renderHook(() => useIdentity());

      expect(result.current.isIndividual).toBe(false);
      expect(result.current.isCompany).toBe(true);
      expect(result.current.isOffice).toBe(false);
      expect(result.current.isBusiness).toBe(true);
    });

    it('hasMultipleIdentities reflects the identities list length', async () => {
      useAuthStore.setState({
        identities: [
          buildIdentity({ id: 'i1' }),
          buildIdentity({ id: 'i2', type: 'COMPANY' }),
        ],
      });
      const { result } = await renderHook(() => useIdentity());

      expect(result.current.hasMultipleIdentities).toBe(true);
    });
  });

  describe('getTypeLabel', () => {
    it('returns the Arabic label per type, empty string for unrecognized', async () => {
      const { result } = await renderHook(() => useIdentity());

      expect(result.current.getTypeLabel('INDIVIDUAL')).toBe('فرد');
      expect(result.current.getTypeLabel('COMPANY')).toBe('شركة');
      expect(result.current.getTypeLabel('OFFICE')).toBe('مكتب');
      expect(result.current.getTypeLabel('UNKNOWN' as any)).toBe('');
    });
  });
});
