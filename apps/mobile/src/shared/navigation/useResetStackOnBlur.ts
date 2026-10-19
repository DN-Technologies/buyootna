import {
  CommonActions,
  type NavigationState,
  type PartialState,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useEffect } from 'react';

type NestedState = NavigationState | PartialState<NavigationState>;

/**
 * For a Stack nested in the tabs (the company / office `(more)` groups):
 * every visit starts from just the screen asked for. A stack can't pop its
 * last screen, so a form left with back stayed underneath: opening إضافة
 * خدمة or تعديل الملف after an earlier إضافة مشروع stacked on top of it, and
 * back (or saving) landed on the project form.
 *
 * Two guards, as one alone proved unreliable on device:
 * - entering the group (its tab gains focus) keeps only the screen just
 *   opened, dropping anything left underneath;
 * - leaving it forgets its screens altogether.
 * Moving between screens inside the group (الباقات › سجل الاشتراك) doesn't
 * refocus the tab, so its back works as before.
 */
export function useResetStackOnBlur() {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      const nested = navigation
        .getState()
        ?.routes.find((item) => item.key === route.key)?.state as
        | NestedState
        | undefined;
      const routes = nested?.routes ?? [];
      if (!nested?.key || routes.length < 2) return;
      const top = routes[nested.index ?? routes.length - 1];
      navigation.dispatch({
        ...CommonActions.reset({ index: 0, routes: [top] } as Parameters<
          typeof CommonActions.reset
        >[0]),
        target: nested.key,
      });
    });

    const onBlur = navigation.addListener('blur', () => {
      navigation.dispatch((state) =>
        CommonActions.reset({
          ...state,
          routes: state.routes.map((item) =>
            item.key === route.key ? { ...item, state: undefined } : item,
          ),
        }),
      );
    });

    return () => {
      onFocus();
      onBlur();
    };
  }, [navigation, route.key]);
}
