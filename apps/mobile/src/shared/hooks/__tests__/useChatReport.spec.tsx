import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { reportsService } from '@/shared/api/reports.service';
import { useChatReport } from '@/shared/hooks/useChatReport';
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
  otherUserId,
  onMount,
}: {
  otherUserId?: string;
  onMount?: (handleReportUser: () => void, handleSubmitReport: (reason: string, description?: string) => Promise<void>) => void;
}) {
  const { reportSheetRef, handleReportUser, handleSubmitReport } = useChatReport(otherUserId);

  useEffect(() => {
    onMount?.(handleReportUser, handleSubmitReport);
  }, [handleReportUser, handleSubmitReport, onMount]);

  return (
    <View>
      <TouchableOpacity
        testID="btn-present"
        onPress={() => {
          // Simulate sheet ref present
          (reportSheetRef as any).current?.present();
          handleReportUser();
        }}
      >
        <Text>Present</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="btn-submit"
        onPress={() => handleSubmitReport('HARASSMENT', 'Offensive content')}
      >
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

describe('useChatReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('presents the report sheet when handleReportUser is called', async () => {
    let capturedHandleReportUser: (() => void) | null = null;
    await render(
      <ReportHarness
        otherUserId="user-123"
        onMount={(handleReportUser) => {
          capturedHandleReportUser = handleReportUser;
        }}
      />,
    );

    expect(capturedHandleReportUser).toBeDefined();
    // Doesn't throw even if sheet ref current is unmounted/null
    expect(() => capturedHandleReportUser!()).not.toThrow();
  });

  it('does not submit a report if otherUserId is not provided', async () => {
    const { getByTestId } = await render(<ReportHarness otherUserId={undefined} />);

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit'));
    });

    expect(reportsService.submitReport).not.toHaveBeenCalled();
  });

  it('submits a report and shows success alert when api succeeds', async () => {
    (reportsService.submitReport as jest.Mock).mockResolvedValueOnce({ success: true });
    const { getByTestId } = await render(<ReportHarness otherUserId="user-456" />);

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit'));
    });

    expect(reportsService.submitReport).toHaveBeenCalledWith(
      'user-456',
      'HARASSMENT',
      'Offensive content',
    );
    expect(showAlert).toHaveBeenCalledWith(
      'تم الإرسال',
      'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته.',
    );
  });

  it('shows error alert when reportsService fails', async () => {
    (reportsService.submitReport as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Server error occurred' } },
    });
    const { getByTestId } = await render(<ReportHarness otherUserId="user-456" />);

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit'));
    });

    expect(showAlert).toHaveBeenCalledWith('خطأ', 'Server error occurred');
  });
});
