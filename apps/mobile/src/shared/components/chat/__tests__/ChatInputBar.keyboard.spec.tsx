import { render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChatInputBar from '@/shared/components/chat/ChatInputBar';
import { useKeyboardHeight } from '@/shared/hooks/device/useKeyboardHeight';

import { useIosKeyboardInset } from '../input-bar/useIosKeyboardInset';

jest.mock('@/shared/utils/chatAttachments', () => ({
  pickPhotos: jest.fn(),
  takePhoto: jest.fn(),
  pickDocuments: jest.fn(),
}));
jest.mock('@/shared/hooks/device/useKeyboardHeight', () => ({
  useKeyboardHeight: jest.fn(() => 0),
}));
jest.mock('../input-bar/useIosKeyboardInset', () => ({
  useIosKeyboardInset: jest.fn(() => 0),
}));

const setPlatform = (os: 'ios' | 'android') =>
  Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });

const bottomSpace = async () => {
  await render(
    <ChatInputBar
      inputText=""
      onInputChange={jest.fn()}
      onSend={jest.fn()}
      showAttachmentMenu={false}
      setShowAttachmentMenu={jest.fn()}
      onPickedFiles={jest.fn()}
    />,
  );
  return StyleSheet.flatten(screen.getByTestId('chat-input-row').props.style)
    .paddingBottom;
};

describe('ChatInputBar above the keyboard', () => {
  const originalOS = Platform.OS;
  beforeEach(() => {
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, bottom: 24, left: 0, right: 0 });
    (useKeyboardHeight as jest.Mock).mockReturnValue(0);
    (useIosKeyboardInset as jest.Mock).mockReturnValue(0);
  });
  afterAll(() => setPlatform(originalOS as 'ios' | 'android'));

  // QA (Galaxy A36): the keyboard covered the message field. Drawing edge
  // to edge, Android no longer resizes the window for the keyboard
  it('lifts the field above the keyboard on Android', async () => {
    setPlatform('android');
    // React Native reports the keyboard without the navigation bar
    (useKeyboardHeight as jest.Mock).mockReturnValue(300);

    // keyboard + navigation bar + breathing room
    expect(await bottomSpace()).toBe(300 + 24 + 8);
  });

  it('sits on the navigation bar on Android while the keyboard is closed', async () => {
    setPlatform('android');
    expect(await bottomSpace()).toBe(24);
  });

  it('keeps the iPhone behaviour as it was', async () => {
    setPlatform('ios');
    (useIosKeyboardInset as jest.Mock).mockReturnValue(336);
    // The Android measure is ignored on iOS
    (useKeyboardHeight as jest.Mock).mockReturnValue(300);

    expect(await bottomSpace()).toBe(336 + 8);
  });
});
