import HeaderOptionsMenu from '../HeaderOptionsMenu';

export interface PortfolioOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  // Every project is hidden: offer to show them again instead
  allHidden: boolean;
  onToggleAllHidden: () => void;
  onDeleteAll: () => void;
}

/**
 * ⋮ on معرض الأعمال (Figma 4410:169770): اخفاء جميع المشاريع (or اظهار
 * جميع المشاريع once all are hidden) and حذف الكل in red.
 */
export default function PortfolioOptionsMenu({
  visible,
  onClose,
  allHidden,
  onToggleAllHidden,
  onDeleteAll,
}: PortfolioOptionsMenuProps) {
  return (
    <HeaderOptionsMenu
      testID="portfolio-options"
      visible={visible}
      onClose={onClose}
      options={[
        {
          label: allHidden ? 'اظهار جميع المشاريع' : 'اخفاء جميع المشاريع',
          onPress: onToggleAllHidden,
          testID: 'portfolio-options-toggle-hidden',
        },
        {
          label: 'حذف الكل',
          onPress: onDeleteAll,
          testID: 'portfolio-options-delete-all',
          danger: true,
        },
      ]}
    />
  );
}
