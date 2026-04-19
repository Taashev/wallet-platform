import type { PropsWithChildren } from 'react';

type AppShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function AppShell({
  eyebrow,
  title,
  description,
  children,
}: AppShellProps) {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="hero-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-description">{description}</p>
      </section>
      {children}
    </main>
  );
}
