import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { reportsService } from '@/shared/api/reports.service';
import { useCompanyReport } from '@/shared/hooks/useCompanyReport';
import { showAlert } from '@/shared/utils/alert';

jest.mock('@/shared/api/reports.service', () => ({
  reportsService: {
    submitReport: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

function ReportHarness({
  targetUserId,
  onMount,
}: {
  targetUserId?: string;
  onMount?: (
    handleOpenReport: () => void,
    handleSubmitReport: (reason: string, description?: string) => Promise<void>,
  ) => void;
}) {
  const { reportSheetRef, handleOpenReport, handleSubmitReport } =
    useCompanyReport(targetUserId);

  useEffect(() => {
    onMount?.(handleOpenReport, handleSubmitReport);
  }, [handleOpenReport, handleSubmitReport, onMount]);

  return (
    <View>
      <TouchableOpacity
        testID="btn-present"
        onPress={() => {
          (reportSheetRef as any).current?.present();
          handleOpenReport();
        }}
      >
        <Text>Present</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="btn-submit"
        onPress={() => handleSubmitReport('SPAM', 'Unsolicited messages')}
      >
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

describe('useCompanyReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('initializes with a valid ref and triggers present on open', async () => {
    let capturedOpen: (() => void) | undefined;

    await render(
      <ReportHarness
        targetUserId="user-123"
        onMount={(open) => {
          capturedOpen = open;
        }}
      />,
    );

    expect(typeof capturedOpen).toBe('function');
  });

  it('calls reportsService.submitReport with reason and description on submit', async () => {
    (reportsService.submitReport as jest.Mock).mockResolvedValueOnce({
      success: true,
    });

    const { getByTestId } = await render(
      <ReportHarness targetUserId="company-user-1" />,
    );

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit'));
    });

    expect(reportsService.submitReport).toHaveBeenCalledWith(
      'company-user-1',
      'SPAM',
      'Unsolicited messages',
    );
    expect(showAlert).toHaveBeenCalledWith(
      'تم الإرسال',
      'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته.',
    );
  });

  it('shows error alert when reportsService.submitReport fails', async () => {
    (reportsService.submitReport as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Server error occurred' } },
    });

    const { getByTestId } = await render(
      <ReportHarness targetUserId="company-user-1" />,
    );

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit'));
    });

    expect(showAlert).toHaveBeenCalledWith('خطأ', 'Server error occurred');
  });

  it('does not submit report if targetUserId is missing', async () => {
    const { getByTestId } = await render(<ReportHarness targetUserId="" />);

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit'));
    });

    expect(reportsService.submitReport).not.toHaveBeenCalled();
  });
});
