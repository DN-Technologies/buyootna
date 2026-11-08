import {
  CommonActions,
  type NavigationContainerRefWithCurrent,
  type NavigationState,
  type ParamListBase,
  type PartialState,
} from '@react-navigation/native';

import type { IdentityType } from '@/shared/store/useAuthStore';

type AnyState = NavigationState | PartialState<NavigationState>;

const HOME: Record<IdentityType, { group: string; screen: string }> = {
  INDIVIDUAL: { group: '(individual)', screen: 'home' },
  COMPANY: { group: '(company)', screen: 'home' },
  OFFICE: { group: '(office)', screen: 'office-home' },
};

/** The stack holding the profile groups side by side. */
function findGroupsStack(state: AnyState | undefined): AnyState | undefined {
  if (!state) return undefined;
  if (state.routes.some((route) => route.name === '(individual)')) return state;
  if (state.routeNames?.includes('(individual)')) return state;
  for (const route of state.routes) {
    const found = findGroupsStack(route.state as AnyState | undefined);
    if (found) return found;
  }
  return undefined;
}

/**
 * Leaves only `type`'s home on the stack that holds the profile groups.
 *
 * Deleting a company or office happens on «اعدادات الحساب», which lives in
 * the (individual) group pushed over that profile's tabs. resetToIdentityHome
 * dismissed that stack back to its first screen (the deleted company's tabs)
 * and its replace didn't take, so the company screens stayed until a
 * restart (QA). Here the whole stack is reset in one step instead.
 * Returns false when the stack can't be found (the caller falls back).
 */
export function resetToProfileHome(
  navigationRef: NavigationContainerRefWithCurrent<ParamListBase>,
  type: IdentityType,
): boolean {
  if (!navigationRef.isReady()) return false;
  const stack = findGroupsStack(navigationRef.getRootState());
  if (!stack?.key) return false;
  const home = HOME[type];
  navigationRef.dispatch({
    ...CommonActions.reset({
      index: 0,
      // The group opens on its home with no tab history behind it
      routes: [
        {
          name: home.group,
          state: { index: 0, routes: [{ name: home.screen }] },
        },
      ],
    }),
    target: stack.key,
  });
  return true;
}
