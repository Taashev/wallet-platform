import type { PropsWithChildren, ReactNode } from 'react';

type DashboardPanelProps = PropsWithChildren<{
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}>;

export function DashboardPanel({
  title,
  description,
  action,
  className,
  children,
}: DashboardPanelProps) {
  const composedClassName = className
    ? `dashboard-panel ${className}`
    : 'dashboard-panel';

  return (
    <section className={composedClassName}>
      {title || description || action ? (
        <header className="dashboard-panel__header">
          <div className="dashboard-panel__header-copy">
            {title ? <h2 className="dashboard-panel__title">{title}</h2> : null}
            {description ? (
              <p className="dashboard-panel__description">{description}</p>
            ) : null}
          </div>
          {action ? <div className="dashboard-panel__action">{action}</div> : null}
        </header>
      ) : null}
      <div className="dashboard-panel__body">{children}</div>
    </section>
  );
}
