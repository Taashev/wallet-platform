import type { ReactNode } from 'react';

type DashboardNoticeProps = {
  title: string;
  description: string;
  tone: 'info' | 'success' | 'error';
  actions?: ReactNode;
};

export function DashboardNotice({
  title,
  description,
  tone,
  actions,
}: DashboardNoticeProps) {
  return (
    <section
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={`dashboard-notice dashboard-notice--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <strong>{title}</strong>
      <p>{description}</p>
      {actions ? <div className="dashboard-notice__actions">{actions}</div> : null}
    </section>
  );
}
