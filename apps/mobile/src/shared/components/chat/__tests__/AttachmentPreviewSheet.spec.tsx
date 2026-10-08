import { fireEvent, render, screen } from '@testing-library/react-native';

import AttachmentPreviewSheet from '@/shared/components/chat/AttachmentPreviewSheet';

jest.mock('expo-image-picker', () => ({}));
jest.mock('expo-document-picker', () => ({}));

const photo = (name: string, size = 1000) => ({
  uri: `file:///${name}`,
  name,
  mimeType: 'image/jpeg',
  size,
  kind: 'IMAGE' as const,
});

describe('AttachmentPreviewSheet', () => {
  it('sends the kept files with the caption', async () => {
    const onSend = jest.fn();
    await render(
      <AttachmentPreviewSheet
        files={[photo('1.jpg'), photo('2.jpg')]}
        onClose={jest.fn()}
        onSend={onSend}
      />,
    );
    expect(screen.getAllByTestId('attachment-preview-item')).toHaveLength(2);

    await fireEvent.press(screen.getByTestId('attachment-preview-remove-0'));
    await fireEvent.changeText(screen.getByTestId('attachment-preview-caption'), 'الواجهة');
    await fireEvent.press(screen.getByTestId('attachment-preview-send'));

    expect(onSend).toHaveBeenCalledWith([photo('2.jpg')], 'الواجهة');
  });

  it('explains and blocks an oversize photo', async () => {
    const onSend = jest.fn();
    await render(
      <AttachmentPreviewSheet
        files={[photo('big.jpg', 12 * 1024 * 1024)]}
        onClose={jest.fn()}
        onSend={onSend}
      />,
    );
    expect(screen.getByTestId('attachment-preview-problem')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('attachment-preview-send'));
    expect(onSend).not.toHaveBeenCalled();
  });
});
