import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { Share, Text, TouchableOpacity, View } from 'react-native';

import { chatService } from '@/shared/api/chat.service';
import { usePropertyActions } from '@/shared/hooks/properties/usePropertyActions';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { openUrlThrottled } from '@/shared/utils/openUrl';
import { PropertyDetailsDto } from '@/types/property';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/shared/api/chat.service', () => ({
  chatService: {
    createConversation: jest.fn(),
  },
}));

jest.mock('@/shared/navigation/getIdentityHomeRoute', () => ({
  resetToIdentityHome: jest.fn(),
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

jest.mock('@/shared/utils/openUrl', () => ({
  openUrlThrottled: jest.fn(() => Promise.resolve()),
}));

const mockShare = jest.fn(() => Promise.resolve({ action: 'sharedAction' }));
jest.spyOn(Share, 'share').mockImplementation(mockShare as any);

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockToggleFavorite = jest.fn();
const mockGuardAction = jest.fn(async (action: () => void | Promise<void>) => {
  await action();
});

function ActionsHarness({
  property,
}: {
  property?: PropertyDetailsDto | null;
}) {
  const {
    handleWhatsapp,
    handleCall,
    handleChat,
    handleShare,
    handleFavoriteToggle,
    handleHostPress,
    handleBack,
  } = usePropertyActions({
    property,
    guardAction: mockGuardAction,
    toggleFavorite: mockToggleFavorite,
  });

  return (
    <View>
      <TouchableOpacity testID="btn-whatsapp" onPress={handleWhatsapp}>
        <Text>WhatsApp</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="btn-call" onPress={handleCall}>
        <Text>Call</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="btn-chat" onPress={handleChat}>
        <Text>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="btn-share" onPress={handleShare}>
        <Text>Share</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="btn-favorite" onPress={handleFavoriteToggle}>
        <Text>Favorite</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="btn-host" onPress={handleHostPress}>
        <Text>Host</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="btn-back" onPress={handleBack}>
        <Text>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

async function renderActions(property?: PropertyDetailsDto | null) {
  const utils = await render(<ActionsHarness property={property} />);
  const press = async (testId: string) => {
    await act(async () => {
      fireEvent.press(utils.getByTestId(testId));
    });
  };
  return { ...utils, press };
}

const baseProperty: PropertyDetailsDto = {
  id: 'prop-100',
  type: 'SALE',
  category: 'villa',
  price: 250000,
  location: 'قرطبة',
  areaSize: 500,
  area: 500,
  isFeatured: false,
  beds: 5,
  baths: 4,
  phoneNumber: '98765432',
  description: 'فيلا راقية',
  images: ['https://example.com/img1.jpg'],
  createdAt: '2025-01-01T00:00:00.000Z',
  views: 120,
  host: {
    id: 'host-1',
    name: 'عبدالله',
    role: 'INDIVIDUAL',
    rating: 4.8,
    avatarUrl: '',
    joinedDate: '1/2024',
    isVerified: false,
  },
};

describe('usePropertyActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
      canGoBack: mockCanGoBack,
    });
    mockCanGoBack.mockReturnValue(true);
    useAuthStore.setState({ user: null });
  });

  afterEach(() => {
    cleanup();
  });

  describe('handleWhatsapp', () => {
    it('shows alert when phoneNumber is not provided', async () => {
      const { press } = await renderActions({
        ...baseProperty,
        phoneNumber: undefined,
      });
      await press('btn-whatsapp');

      expect(showAlert).toHaveBeenCalledWith(
        'تنبيه',
        'لا يوجد رقم هاتف متاح لهذا الإعلان',
      );
      expect(openUrlThrottled).not.toHaveBeenCalled();
    });

    it('launches normalized Kuwait whatsapp URL when phone is present', async () => {
      const { press } = await renderActions(baseProperty);
      await press('btn-whatsapp');

      expect(openUrlThrottled).toHaveBeenCalledWith(
        'whatsapp://send?phone=96598765432',
      );
    });
  });

  describe('handleCall', () => {
    it('shows alert when phone is missing', async () => {
      const { press } = await renderActions({
        ...baseProperty,
        phoneNumber: undefined,
      });
      await press('btn-call');

      expect(showAlert).toHaveBeenCalledWith(
        'تنبيه',
        'لا يوجد رقم هاتف متاح لهذا الإعلان',
      );
      expect(openUrlThrottled).not.toHaveBeenCalled();
    });

    it('calls openUrlThrottled with tel scheme when phone is present', async () => {
      const { press } = await renderActions(baseProperty);
      await press('btn-call');

      expect(openUrlThrottled).toHaveBeenCalledWith('tel:98765432');
    });
  });

  describe('handleShare', () => {
    it('shares property with formatted title and URL', async () => {
      const { press } = await renderActions(baseProperty);
      await press('btn-share');

      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('https://buyootna.cloud/property/prop-100'),
        }),
      );
    });
  });

  describe('handleFavoriteToggle', () => {
    it('toggles favorite through guardAction', async () => {
      const { press } = await renderActions(baseProperty);
      await press('btn-favorite');

      expect(mockGuardAction).toHaveBeenCalled();
      expect(mockToggleFavorite).toHaveBeenCalledWith('prop-100');
    });
  });

  describe('handleHostPress', () => {
    it('navigates to company screen when host is a company', async () => {
      const companyProperty = {
        ...baseProperty,
        host: { ...baseProperty.host!, id: 'comp-10', role: 'COMPANY' as const },
      };
      const { press } = await renderActions(companyProperty);
      await press('btn-host');

      expect(mockRouterPush).toHaveBeenCalledWith('/company/comp-10');
    });

    it('navigates to profile screen when host is an individual', async () => {
      const { press } = await renderActions(baseProperty);
      await press('btn-host');

      expect(mockRouterPush).toHaveBeenCalledWith('/profile/host-1');
    });
  });

  describe('handleChat', () => {
    it('prevents user from starting chat with self', async () => {
      useAuthStore.setState({
        user: {
          id: 'host-1',
          email: 'test@example.com',
          role: 'INDIVIDUAL',
          phone: '12345678',
          isDisabled: false,
          isBlocked: false,
          createdAt: '2025-01-01',
        },
      });

      const { press } = await renderActions(baseProperty);
      await press('btn-chat');

      expect(showAlert).toHaveBeenCalledWith(
        'تنبيه',
        'لا يمكنك بدء محادثة مع نفسك، هذا الإعلان خاص بك.',
      );
      expect(chatService.createConversation).not.toHaveBeenCalled();
    });

    it('shows alert when hostId is missing', async () => {
      const propertyWithoutHost = {
        ...baseProperty,
        host: undefined,
      } as unknown as PropertyDetailsDto;

      const { press } = await renderActions(propertyWithoutHost);
      await press('btn-chat');

      expect(showAlert).toHaveBeenCalledWith(
        'تنبيه',
        'تعذر بدء المحادثة، بيانات المعلن غير متاحة حالياً',
      );
      expect(chatService.createConversation).not.toHaveBeenCalled();
    });

    it('opens the chat screen immediately, without waiting on the network', async () => {
      const { press } = await renderActions(baseProperty);
      await press('btn-chat');

      // The chat screen creates the conversation while showing its loader
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: '/chat/[id]',
        params: { id: 'new', recipientId: 'host-1', propertyId: 'prop-100' },
      });
      expect(chatService.createConversation).not.toHaveBeenCalled();
    });
  });

  describe('handleBack', () => {
    it('navigates back', async () => {
      const { press } = await renderActions(baseProperty);
      await press('btn-back');

      expect(mockRouterBack).toHaveBeenCalled();
    });

    it('goes home when the ad page was opened first (nothing to go back to)', async () => {
      mockCanGoBack.mockReturnValue(false);
      useAuthStore.setState({ activeIdentity: { type: 'COMPANY' } as never });
      const { press } = await renderActions(baseProperty);
      await press('btn-back');

      expect(mockRouterBack).not.toHaveBeenCalled();
      expect(resetToIdentityHome).toHaveBeenCalledWith('COMPANY');
    });
  });
});
