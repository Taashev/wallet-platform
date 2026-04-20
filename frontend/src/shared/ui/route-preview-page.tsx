import type { ReactNode } from 'react';
import { SurfaceCard } from '@/shared/ui/surface-card';

type PreviewItem = {
  title: string;
  description: string;
};

type RoutePreviewPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  items: PreviewItem[];
  nextSteps: string[];
  actions?: ReactNode;
};

export function RoutePreviewPage({
  eyebrow,
  title,
  description,
  status,
  items,
  nextSteps,
  actions,
}: RoutePreviewPageProps) {
  return (
    <section className="route-preview">
      <header className="route-preview__header">
        <span className="route-preview__eyebrow">{eyebrow}</span>
        <span className="route-preview__status">{status}</span>
      </header>

      <div className="route-preview__intro">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {actions ? <div className="route-preview__actions">{actions}</div> : null}

      <div className="route-preview__grid">
        {items.map((item) => (
          <SurfaceCard
            key={item.title}
            title={item.title}
            tone="muted"
          >
            <p>{item.description}</p>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard
        eyebrow="Next steps"
        title="What gets connected in later tasks"
      >
        <ul className="route-preview__list">
          {nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </SurfaceCard>
    </section>
  );
}
