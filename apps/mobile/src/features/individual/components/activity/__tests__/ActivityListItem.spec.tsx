import { act, fireEvent, render } from '@testing-library/react-native';

import ActivityListItem from '../ActivityListItem';
import { makeActivityItem } from './draftFixture';

// QA: tapping an ad in نشاطي did nothing -- the active card had no press
// handler. Every card now opens its ad (a draft opens its preview).

jest.mock('expo-image', () => require('./draftFixture').mockExpoImage());

const handlers = () => ({
  onDeletePress: jest.fn(),
  onPublishDraftPress: jest.fn(),
  onOpenAdPress: jest.fn(),
  onOpenPress: jest.fn(),
});

const renderItem = async (
  status: string,
  activeFilterId: 'ALL' | 'ARCHIVED' = 'ALL',
) => {
  const h = handlers();
  const property = makeActivityItem({ id: 'ad-1', status } as any);
  const utils = await render(
    <ActivityListItem
      property={property}
      activeFilterId={activeFilterId as any}
      {...h}
    />,
  );
  return { ...utils, h, property };
};

describe('ActivityListItem taps', () => {
  it("opens an active ad's details sheet when its card is tapped", async () => {
    const { getByTestId, queryByTestId, h, property } =
      await renderItem('ACTIVE');

    await act(async () => {
      fireEvent.press(getByTestId('active-ad-card-ad-1'));
    });

    expect(h.onOpenAdPress).toHaveBeenCalledWith(property);
    expect(h.onOpenPress).not.toHaveBeenCalled();
    // The ⋮ menu is gone: everything lives in the sheet
    expect(queryByTestId('active-ad-menu-ad-1')).toBeNull();
  });

  it('opens an archived ad', async () => {
    const { getByTestId, h, property } = await renderItem(
      'EXPIRED',
      'ARCHIVED',
    );

    await act(async () => {
      fireEvent.press(getByTestId('archived-ad-card'));
    });

    expect(h.onOpenPress).toHaveBeenCalledWith(property);
    expect(h.onOpenAdPress).not.toHaveBeenCalled();
  });

  it('previews a draft when its card is tapped; its buttons keep their actions', async () => {
    const { getByTestId, getByText, h, property } = await renderItem('DRAFT');

    await act(async () => {
      fireEvent.press(getByTestId('draft-ad-card-ad-1'));
    });
    expect(h.onPublishDraftPress).toHaveBeenCalledWith(property);

    await act(async () => {
      fireEvent.press(getByText('حذف'));
    });
    expect(h.onDeletePress).toHaveBeenCalledWith('ad-1');
    expect(h.onPublishDraftPress).toHaveBeenCalledTimes(1);
    expect(h.onOpenPress).not.toHaveBeenCalled();
  });
});
