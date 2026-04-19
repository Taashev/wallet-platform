import type { PropsWithChildren, ReactNode } from 'react';

type AppShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}>;

export function AppShell({
  eyebrow,
  title,
  description,
  actions,
  aside,
  children,
}: AppShellProps) {
  return (
    <main className="app-shell">
      <header className="app-shell__header">
        <div className="brand-mark">
          <span
            aria-hidden="true"
            className="brand-mark__icon"
          >
            U
          </span>
          <div className="brand-mark__copy">
            <span className="brand-mark__title">Users Service Web</span>
            <span className="brand-mark__caption">Product shell foundation</span>
          </div>
        </div>
        <span className="app-shell__status">React + TypeScript MVP</span>
      </header>

      <section className="hero-panel">
        <div className="hero-panel__content">
          <p className="hero-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="hero-description">{description}</p>
          {actions ? <div className="hero-actions">{actions}</div> : null}
        </div>
        {aside ? <div className="hero-panel__aside">{aside}</div> : null}
      </section>

      <div className="app-shell__content">{children}</div>
    </main>
  );
}
