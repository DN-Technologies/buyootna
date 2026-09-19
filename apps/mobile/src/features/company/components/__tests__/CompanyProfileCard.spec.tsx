import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import CompanyProfileCard from '../CompanyProfileCard';

describe('CompanyProfileCard', () => {
  const defaultProps = {
    displayName: 'المنار للعقارات',
    avatarUrl: 'https://example.com/logo.png',
    accountTypeLabel: 'شركة',
    isVerified: true,
    description:
      'شركة متخصصة في صيانة وتركيب وتعديل كافة الاعمال الكهربائية مع خدمات استشارية متكاملة.',
    location: 'السالمية • شمال غرب صليبيخات',
    onOpenAccountSelector: jest.fn(),
    onEditPress: jest.fn(),
    onPreviewPress: jest.fn(),
    onSharePress: jest.fn(),
  };

  it('renders company details and verified badge correctly', async () => {
    const { getByText } = await render(<CompanyProfileCard {...defaultProps} />);

    expect(getByText('المنار للعقارات')).toBeTruthy();
    expect(getByText('شركة')).toBeTruthy();
    expect(
      getByText(
        'شركة متخصصة في صيانة وتركيب وتعديل كافة الاعمال الكهربائية مع خدمات استشارية متكاملة.'
      )
    ).toBeTruthy();
    expect(getByText('السالمية • شمال غرب صليبيخات')).toBeTruthy();
  });

  it('handles account selector click', async () => {
    const onOpenAccountSelector = jest.fn();
    const { getByText } = await render(
      <CompanyProfileCard
        {...defaultProps}
        onOpenAccountSelector={onOpenAccountSelector}
      />
    );

    fireEvent.press(getByText('شركة'));
    expect(onOpenAccountSelector).toHaveBeenCalledTimes(1);
  });

  it('triggers action buttons (Edit, Preview, Share)', async () => {
    const onEditPress = jest.fn();
    const onPreviewPress = jest.fn();
    const onSharePress = jest.fn();

    const { getByText } = await render(
      <CompanyProfileCard
        {...defaultProps}
        onEditPress={onEditPress}
        onPreviewPress={onPreviewPress}
        onSharePress={onSharePress}
      />
    );

    fireEvent.press(getByText('تعديل'));
    expect(onEditPress).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('معاينة'));
    expect(onPreviewPress).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('مشاركة'));
    expect(onSharePress).toHaveBeenCalledTimes(1);
  });
});
