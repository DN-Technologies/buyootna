import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { chatService } from '@/shared/api/chat.service';
import { UserProfile } from '@/shared/components/profile/types';
import {
  normalizeKuwaitPhone,
  useProfileContact,
} from '@/shared/hooks/providers/useProfileContact';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { openUrlThrottled } from '@/shared/utils/openUrl';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/shared/api/chat.service', () => ({
  chatService: {
    createConversation: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

jest.mock('@/shared/utils/openUrl', () => ({
  openUrlThrottled: jest.fn(() => Promise.resolve()),
}));

const mockRouterPush = jest.fn();
const mockUseRouter = useRouter as jest.Mock;

function ContactHarness({ userProfile }: { userProfile?: UserProfile }) {
  const { canWhatsapp, handleWhatsapp, handleCall, handleChat } =
    useProfileContact(userProfile);

  return (
    <View>
      <Text testID="can-whatsapp">{String(canWhatsapp)}</Text>
      <TouchableOpacity testID="btn-whatsapp" onPress={handleWhatsapp}>
        <Text>WhatsApp</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="btn-call" onPress={handleCall}>
        <Text>Call</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="btn-chat" onPress={handleChat}>
        <Text>Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

async function renderContact(profile?: UserProfile) {
  const utils = await render(<ContactHarness userProfile={profile} />);
  const pressWhatsapp = async () => {
    await act(async () => {
      fireEvent.press(utils.getByTestId('btn-whatsapp'));
    });
  };
  const pressCall = async () => {
    await act(async () => {
      fireEvent.press(utils.getByTestId('btn-call'));
    });
  };
  const pressChat = async () => {
    await act(async () => {
      fireEvent.press(utils.getByTestId('btn-chat'));
    });
  };
  return { ...utils, pressWhatsapp, pressCall, pressChat };
}

describe('useProfileContact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockRouterPush });
  });

  afterEach(() => {
    cleanup();
  });

  describe('normalizeKuwaitPhone', () => {
    it('prepends 965 to 8-digit Kuwait numbers', () => {
      expect(normalizeKuwaitPhone('98765432')).toBe('96598765432');
    });

    it('strips leading + from numbers', () => {
      expect(normalizeKuwaitPhone('+96598765432')).toBe('96598765432');
    });

    it('strips dashes and spaces', () => {
      expect(normalizeKuwaitPhone('+965 98-765-432')).toBe('96598765432');
    });
  });

  describe('handleWhatsapp', () => {
    it('shows alert when phone is not provided', async () => {
      const { pressWhatsapp } = await renderContact(undefined);
      await pressWhatsapp();

      expect(showAlert).toHaveBeenCalledWith(
        'تنبيه',
        'لا يوجد رقم هاتف متاح',
      );
      expect(openUrlThrottled).not.toHaveBeenCalled();
    });

    it('calls openUrlThrottled with normalized WhatsApp URL when phone is present', async () => {
      const mockProfile: UserProfile = {
        id: 'user-1',
        name: 'أحمد',
        avatarUrl: '',
        phone: '98765432',
        rating: 0,
        reviewsCount: 0,
        soldCount: 0,
        presence: null,
        responseTime: null,
        joinedDate: '1/2025',
        role: 'INDIVIDUAL',
      };

      const { pressWhatsapp } = await renderContact(mockProfile);
      await pressWhatsapp();

      expect(openUrlThrottled).toHaveBeenCalledWith(
        'whatsapp://send?phone=96598765432',
      );
    });
  });

  describe('handleCall', () => {
    it('shows alert when phone is missing', async () => {
      const { pressCall } = await renderContact(undefined);
      await pressCall();

      expect(showAlert).toHaveBeenCalledWith(
        'تنبيه',
        'لا يوجد رقم هاتف متاح',
      );
      expect(openUrlThrottled).not.toHaveBeenCalled();
    });

    it('calls openUrlThrottled with tel scheme when phone is present', async () => {
      const mockProfile: UserProfile = {
        id: 'user-1',
        name: 'أحمد',
        avatarUrl: '',
        phone: '+96598765432',
        rating: 0,
        reviewsCount: 0,
        soldCount: 0,
        presence: null,
        responseTime: null,
        joinedDate: '1/2025',
        role: 'INDIVIDUAL',
      };

      const { pressCall } = await renderContact(mockProfile);
      await pressCall();

      expect(openUrlThrottled).toHaveBeenCalledWith('tel:+96598765432');
    });
  });

  describe('handleChat', () => {
    it('does nothing if userProfile is undefined', async () => {
      const { pressChat } = await renderContact(undefined);
      await pressChat();

      expect(chatService.createConversation).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('opens the chat screen immediately, without waiting on the network', async () => {
      const mockProfile: UserProfile = {
        id: 'target-user-1',
        name: 'فهد',
        avatarUrl: '',
        phone: '98765432',
        rating: 0,
        reviewsCount: 0,
        soldCount: 0,
        presence: null,
        responseTime: null,
        joinedDate: '1/2025',
        role: 'INDIVIDUAL',
      };

      const { pressChat } = await renderContact(mockProfile);
      await pressChat();

      // The chat screen creates the conversation while showing its loader
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: '/chat/[id]',
        params: { id: 'new', recipientId: 'target-user-1' },
      });
      expect(chatService.createConversation).not.toHaveBeenCalled();
    });
  });

  describe('canWhatsapp', () => {
    const profile = (role: UserProfile['role']) =>
      ({
        id: 'user-1',
        name: 'أحمد',
        avatarUrl: '',
        phone: '98765432',
        rating: 0,
        reviewsCount: 0,
        soldCount: 0,
        presence: null,
        responseTime: null,
        joinedDate: '1/2025',
        role,
      }) as UserProfile;

    afterEach(() => useAuthStore.setState({ activeIdentity: null }));

    it("is offered on an individual's profile", async () => {
      const { getByTestId } = await renderContact(profile('INDIVIDUAL'));
      expect(getByTestId('can-whatsapp')).toHaveTextContent('true');
    });

    it("is not offered on a company's or office's profile", async () => {
      for (const role of ['COMPANY', 'OFFICE'] as const) {
        const { getByTestId, unmount } = await renderContact(profile(role));
        expect(getByTestId('can-whatsapp')).toHaveTextContent('false');
        await unmount();
      }
    });

    it('is not offered to a company or office viewer', async () => {
      useAuthStore.setState({ activeIdentity: { type: 'COMPANY' } as never });
      const { getByTestId } = await renderContact(profile('INDIVIDUAL'));
      expect(getByTestId('can-whatsapp')).toHaveTextContent('false');
    });
  });
});
