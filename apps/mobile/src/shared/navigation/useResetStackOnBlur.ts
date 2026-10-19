import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useEffect } from 'react';

/**
 * For a Stack nested in the tabs (the company / office `(more)` groups):
 * forget the stack's screens when the user leaves it. Otherwise its first
 * screen stays mounted underneath (a stack can't pop its last screen), so
 * opening إضافة خدمة after an earlier إضافة مشروع stacked on top of it and
 * "back" landed on the project form instead of where the user came from.
 * Dropping the nested state makes the next visit start from just the
 * screen asked for.
 */
export function useResetStackOnBlur() {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(
    () =>
      navigation.addListener('blur', () => {
        navigation.dispatch((state) =>
          CommonActions.reset({
            ...state,
            routes: state.routes.map((item) =>
              item.key === route.key ? { ...item, state: undefined } : item,
            ),
          }),
        );
      }),
    [navigation, route.key],
  );
}
