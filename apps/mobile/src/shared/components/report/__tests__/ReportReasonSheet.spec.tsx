import { render } from '@testing-library/react-native';

import ReportReasonSheet from '../ReportReasonSheet';

jest.mock('@gorhom/bottom-sheet');

// QA: «سبب البلاغ» and «تفاصيل إضافية» lined up on the left
describe('ReportReasonSheet', () => {
  it('its labels read right to left', async () => {
    const { getByTestId } = await render(
      <ReportReasonSheet onSubmit={jest.fn()} />,
    );
    for (const id of ['report-reason-label', 'report-details-label']) {
      expect(getByTestId(id)).toHaveStyle({ writingDirection: 'rtl' });
    }
  });
});
