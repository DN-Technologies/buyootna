import type {
  NavigationContainerRefWithCurrent,
  ParamListBase,
} from '@react-navigation/native';

type RootRef = NavigationContainerRefWithCurrent<ParamListBase>;

let rootRef: RootRef | null = null;

/** Set once by the root layout, for navigation done outside components. */
export function setRootNavigationRef(ref: RootRef | null) {
  rootRef = ref;
}

export function getRootNavigationRef(): RootRef | null {
  return rootRef;
}
