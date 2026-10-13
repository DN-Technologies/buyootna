import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChatMessage } from '@/shared/api/chat.service';
import AttachmentBubble from '@/shared/components/chat/message-list/AttachmentBubble';
import { openLocalChatFile } from '@/shared/utils/openChatFile';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (props: any) => <View {...props} /> };
});
jest.mock('@/shared/utils/openChatFile', () => ({
  openLocalChatFile: jest.fn(async () => {}),
}));
jest.mock('@/shared/api/chat.service', () => ({
  chatService: { attachmentUrl: jest.fn() },
}));

const sentFile = {
  id: 'a1',
  kind: 'FILE',
  fileName: 'عقد.pdf',
  mimeType: 'application/pdf',
  size: 2048,
  url: 'https://s3/doc.pdf?sig=1',
};
const localFile = {
  uri: 'file:///cache/picked.pdf',
  name: 'عقد.pdf',
  mimeType: 'application/pdf',
  size: 2048,
  kind: 'FILE',
};
const message = (over: Partial<ChatMessage>) =>
  ({
    id: 'm1',
    type: 'FILE',
    isMine: true,
    timestamp: '10:00 ص',
    createdAt: '2026-10-13T10:00:00.000Z',
    ...over,
  }) as ChatMessage;

const setup = async (msg: ChatMessage) => {
  const onOpenFile = jest.fn();
  await render(<AttachmentBubble message={msg} status={null} onOpenFile={onOpenFile} />);
  return onOpenFile;
};

describe('a document in the chat', () => {
  beforeEach(() => jest.clearAllMocks());

  // QA (Android): the sender's own file showed a download icon
  it('shows no download icon on a file I sent', async () => {
    await setup(message({ attachments: [sentFile] as never }));
    expect(screen.queryByTestId('attachment-file-download-0')).toBeNull();
  });

  it('shows the download icon on a file I received', async () => {
    await setup(message({ isMine: false, attachments: [sentFile] as never }));
    expect(screen.getByTestId('attachment-file-download-0')).toBeTruthy();
  });

  it('opens a sent or received file through the screen\'s opener', async () => {
    const onOpenFile = await setup(message({ attachments: [sentFile] as never }));
    await fireEvent.press(screen.getByTestId('attachment-file-0'));
    expect(onOpenFile).toHaveBeenCalledWith(sentFile);
    expect(openLocalChatFile).not.toHaveBeenCalled();
  });

  // QA (Android): the sender could not open the file they had just sent
  it('opens my own copy while the file is still uploading', async () => {
    const onOpenFile = await setup(
      message({ id: 'temp-1', sending: true, localAttachments: [localFile] as never }),
    );
    expect(screen.queryByTestId('attachment-file-download-0')).toBeNull();

    await fireEvent.press(screen.getByTestId('attachment-file-0'));

    expect(openLocalChatFile).toHaveBeenCalledWith(localFile);
    expect(onOpenFile).not.toHaveBeenCalled();
  });
});
