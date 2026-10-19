import { render } from '@testing-library/react-native';

import ProviderReplyCard from '../ProviderReplyCard';

describe('ProviderReplyCard', () => {
  it('shows «العرض لا يشمل» when the company gave it', async () => {
    const { getByText } = await render(
      <ProviderReplyCard
        reply={{ message: 'فحص إنشائي', excludes: 'اختبار التربة', notes: null }}
      />,
    );
    expect(getByText('العرض لا يشمل')).toBeTruthy();
    expect(getByText('اختبار التربة')).toBeTruthy();
  });

  it('a reply with only excludes still shows', async () => {
    const { getByText } = await render(
      <ProviderReplyCard reply={{ excludes: 'المواد' }} />,
    );
    expect(getByText('المواد')).toBeTruthy();
  });
});
