import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

type SettingsTabsProps = {
  tabs: Array<{
    label: string;
    to: string;
  }>;
  action?: ReactNode;
};

export function SettingsTabs({ tabs, action }: SettingsTabsProps) {
  return (
    <div className="settings-tabs">
      <nav
        aria-label="Settings sections"
        className="settings-tabs__nav"
      >
        {tabs.map((tab) => (
          <NavLink
            className={({ isActive }) =>
              `settings-tabs__link${isActive ? ' settings-tabs__link--active' : ''}`
            }
            key={tab.to}
            to={tab.to}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      {action ? <div className="settings-tabs__actions">{action}</div> : null}
    </div>
  );
}
