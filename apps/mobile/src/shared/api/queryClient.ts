import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus, Platform } from 'react-native';

// apiClient's response interceptor already logs the user out on 401, so
// query retries never need to special-case auth failures here.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

// React Query's default online detection reads the browser's navigator.onLine
// / window 'online' events, neither of which exist in React Native, so
// without this it silently assumes the device is always online. That means
// a request made while offline is just treated as a normal query error --
// React Query never learns the network came back, so it never resumes/
// refetches, and the app stays stuck until it's force-killed and reopened.
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Companion fix for the same class of "stuck until restart" problem: without
// this, returning the app to the foreground doesn't tell React Query to
// refetch stale queries either.
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

AppState.addEventListener('change', onAppStateChange);
