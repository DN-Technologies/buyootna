export const router = {
  push: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canDismiss: jest.fn(() => false),
  dismissAll: jest.fn(),
};

export const useRouter = () => router;

export const Link = ({ children }: any) => children ?? null;

export const useLocalSearchParams = () => ({});
export const usePathname = () => '/';
export const useSegments = () => [];
export const useFocusEffect = () => {};
