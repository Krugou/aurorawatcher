import { useTranslation } from 'react-i18next';

export type DashboardSection = 'observatory_status' | 'graphs' | 'map';

interface MobileNavProps {
  onNavigate: (section: DashboardSection) => void;
}

const ITEMS: Array<{ id: DashboardSection; labelKey: string; icon: string }> = [
  { id: 'observatory_status', labelKey: 'mobileNav.cameras', icon: '◉' },
  { id: 'graphs', labelKey: 'mobileNav.stats', icon: '▥' },
  { id: 'map', labelKey: 'mobileNav.map', icon: '⌖' },
];

export const MobileNav = ({ onNavigate }: MobileNavProps) => {
  const { t } = useTranslation();

  return (
    <nav className="mobile-bottom-nav" aria-label={t('mobileNav.label')}>
      {ITEMS.map((item) => (
        <button key={item.id} type="button" onClick={() => onNavigate(item.id)}>
          <span className="mobile-nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
};
