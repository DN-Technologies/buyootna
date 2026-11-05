import { Directory, File } from 'expo-file-system';
import * as Print from 'expo-print';

import { showAlert } from '@/shared/utils/alert';

/**
 * Invoice "download": the PDF is written into a folder the user picks (the
 * Files app on iOS, e.g. Downloads on Android), not handed to the share
 * sheet (QA: تحميل opened Share, or said «سيتم تحميل الفاتورة قريباً»).
 * The folder is asked for once per app session: iOS only grants access
 * until the app restarts. Saving silently into Files › On My iPhone needs
 * two Info.plist keys, i.e. a new native build.
 */
let sessionDirectory: Directory | null = null;

export type SaveResult = 'saved' | 'cancelled';

// «فاتورة-INV-12.pdf», or «فاتورة-INV-12 (2).pdf» if that name is taken
function availableName(directory: Directory, fileName: string): string {
  let taken: Set<string>;
  try {
    taken = new Set(directory.list().map((entry) => entry.name));
  } catch {
    return fileName;
  }
  if (!taken.has(fileName)) return fileName;
  const base = fileName.replace(/\.pdf$/i, '');
  for (let n = 2; n < 100; n += 1) {
    const candidate = `${base} (${n}).pdf`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}.pdf`;
}

function writeInto(directory: Directory, fileName: string, bytes: Uint8Array) {
  const target = directory.createFile(
    availableName(directory, fileName),
    'application/pdf',
  );
  target.write(bytes);
}

/** Saves a PDF made from `html` as `fileName`; 'cancelled' if no folder was picked. */
export async function savePdfToDevice(
  html: string,
  fileName: string,
): Promise<SaveResult> {
  const { uri } = await Print.printToFileAsync({ html });
  const bytes = await new File(uri).bytes();

  if (sessionDirectory) {
    try {
      writeInto(sessionDirectory, fileName, bytes);
      return 'saved';
    } catch {
      // Access ended (or the folder is gone): ask again
      sessionDirectory = null;
    }
  }

  let directory: Directory;
  try {
    directory = new Directory((await Directory.pickDirectoryAsync()).uri);
  } catch {
    return 'cancelled';
  }
  writeInto(directory, fileName, bytes);
  sessionDirectory = directory;
  return 'saved';
}

/** Tells the user where it went (QA expected a "download complete" message). */
export function confirmPdfSaved(what: 'الفاتورة' | 'كشف الفواتير') {
  showAlert('تم التحميل', `تم حفظ ${what} في المجلد الذي اخترته.`);
}

/** For tests: forget the session's folder. */
export function resetSavedPdfDirectory() {
  sessionDirectory = null;
}
