import { resetSavedPdfDirectory, savePdfToDevice } from '../savePdfToDevice';

const mockPick = jest.fn();
const mockCreated: { dir: string; name: string; bytes?: Uint8Array }[] = [];
let mockExisting: string[] = [];
let mockFailDir = '';

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(() => Promise.resolve({ uri: 'file:///tmp/x.pdf' })),
}));
jest.mock('expo-file-system', () => {
  class File {
    uri: string;
    constructor(path: string) {
      this.uri = path;
    }
    bytes() {
      return Promise.resolve(new Uint8Array([37, 80, 68, 70]));
    }
  }
  class Directory {
    uri: string;
    constructor(path: string) {
      this.uri = path;
    }
    static pickDirectoryAsync = (...args: unknown[]) => mockPick(...args);
    list() {
      return mockExisting.map((name) => ({ name }));
    }
    createFile(name: string) {
      if (this.uri === mockFailDir) throw new Error('no access');
      const entry: { dir: string; name: string; bytes?: Uint8Array } = {
        dir: this.uri,
        name,
      };
      mockCreated.push(entry);
      return {
        write: (bytes: Uint8Array) => {
          entry.bytes = bytes;
        },
      };
    }
  }
  return { File, Directory };
});
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

// QA: invoice تحميل opened the share sheet (or said «قريباً»): it saves now
describe('savePdfToDevice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreated.length = 0;
    mockExisting = [];
    mockFailDir = '';
    resetSavedPdfDirectory();
  });

  it('writes the PDF into the folder the user picks, then reuses it', async () => {
    mockPick.mockResolvedValue({ uri: 'file:///Files/Downloads' });

    expect(await savePdfToDevice('<p/>', 'فاتورة-INV-1.pdf')).toBe('saved');
    expect(mockCreated[0]).toMatchObject({
      dir: 'file:///Files/Downloads',
      name: 'فاتورة-INV-1.pdf',
    });
    expect(mockCreated[0].bytes).toEqual(new Uint8Array([37, 80, 68, 70]));

    expect(await savePdfToDevice('<p/>', 'فاتورة-INV-2.pdf')).toBe('saved');
    expect(mockPick).toHaveBeenCalledTimes(1);
  });

  it('nothing is written when the user cancels the picker', async () => {
    mockPick.mockRejectedValue(new Error('cancelled'));
    expect(await savePdfToDevice('<p/>', 'a.pdf')).toBe('cancelled');
    expect(mockCreated).toHaveLength(0);
  });

  it('keeps an existing file: a taken name gets (2)', async () => {
    mockPick.mockResolvedValue({ uri: 'file:///Files' });
    mockExisting = ['فاتورة-INV-1.pdf'];
    await savePdfToDevice('<p/>', 'فاتورة-INV-1.pdf');
    expect(mockCreated[0].name).toBe('فاتورة-INV-1 (2).pdf');
  });

  it('asks for a folder again when access to the remembered one ended', async () => {
    mockPick.mockResolvedValue({ uri: 'file:///Files' });
    await savePdfToDevice('<p/>', 'a.pdf');
    mockFailDir = 'file:///Files';
    mockPick.mockResolvedValue({ uri: 'file:///Other' });
    expect(await savePdfToDevice('<p/>', 'b.pdf')).toBe('saved');
    expect(mockPick).toHaveBeenCalledTimes(2);
    expect(mockCreated.at(-1)).toMatchObject({ dir: 'file:///Other', name: 'b.pdf' });
  });
});
