import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { Keyboard } from 'react-native';

import ChatInputBar from '@/shared/components/chat/ChatInputBar';
import { pickPhotos } from '@/shared/utils/chatAttachments';

jest.mock('@/shared/utils/chatAttachments', () => ({
  pickPhotos: jest.fn(),
  takePhoto: jest.fn(),
  pickDocuments: jest.fn(),
}));

function Harness({
  onPickedFiles,
  onCompose,
}: {
  onPickedFiles: jest.Mock;
  onCompose?: jest.Mock;
}) {
  const [open, setOpen] = useState(false);
  return (
    <ChatInputBar
      inputText=""
      onInputChange={jest.fn()}
      onSend={jest.fn()}
      showAttachmentMenu={open}
      setShowAttachmentMenu={setOpen}
      onPickedFiles={onPickedFiles}
      onCompose={onCompose}
    />
  );
}

// QA: "+" should swap the keyboard for the attachment panel, like WhatsApp
describe('ChatInputBar — attachment panel', () => {
  it('"+" hides the keyboard and opens the panel; picking photos hands them over', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    const photos = [{ uri: 'file:///1.jpg', name: '1.jpg', mimeType: 'image/jpeg', kind: 'IMAGE' }];
    (pickPhotos as jest.Mock).mockResolvedValue(photos);
    const onPickedFiles = jest.fn();
    await render(<Harness onPickedFiles={onPickedFiles} />);

    expect(screen.queryByTestId('attachment-panel')).toBeNull();
    await fireEvent.press(screen.getByTestId('chat-attach-button'));
    expect(dismiss).toHaveBeenCalled();
    expect(screen.getByTestId('attachment-panel')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('attach-photos'));
    expect(onPickedFiles).toHaveBeenCalledWith(photos);
    expect(screen.queryByTestId('attachment-panel')).toBeNull();
  });

  it('tapping the button again goes back to the keyboard', async () => {
    await render(<Harness onPickedFiles={jest.fn()} />);
    await fireEvent.press(screen.getByTestId('chat-attach-button'));
    await fireEvent.press(screen.getByTestId('chat-attach-button'));
    expect(screen.queryByTestId('attachment-panel')).toBeNull();
  });

  it('عقار / الموقع / موعد معاينة / عرض سعر open their forms', async () => {
    const onCompose = jest.fn();
    await render(<Harness onPickedFiles={jest.fn()} onCompose={onCompose} />);
    for (const key of ['property', 'location', 'appointment', 'offer']) {
      await fireEvent.press(screen.getByTestId('chat-attach-button'));
      await fireEvent.press(screen.getByTestId(`attach-${key}`));
    }
    expect(onCompose.mock.calls.map((c) => c[0])).toEqual([
      'property',
      'location',
      'appointment',
      'offer',
    ]);
    expect(screen.queryByTestId('attachment-panel')).toBeNull();
  });
});
