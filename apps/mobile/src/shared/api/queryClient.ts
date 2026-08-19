import { QueryClient } from '@tanstack/react-query';

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
