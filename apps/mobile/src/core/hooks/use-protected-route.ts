import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

// Helper hook to handle redirects based on auth state
export function useProtectedRoute(user: any, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Rule 1: If logged in AND sitting on an auth screen, push to main app
    if (user && inAuthGroup) {
      router.replace('/(main)/home');
    }
  }, [user, segments, isLoading]);
}
