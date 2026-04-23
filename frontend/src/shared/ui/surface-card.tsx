import type { PropsWithChildren } from 'react';

type SurfaceCardProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  tone?: 'default' | 'accent' | 'muted';
  className?: string;
}>;

export function SurfaceCard({
  eyebrow,
  title,
  tone = 'default',
  className,
  children,
}: SurfaceCardProps) {
  const toneClassName = tone === 'default' ? '' : ` surface-card--${tone}`;
  const optionalClassName = className ? ` ${className}` : '';

  return (
    <article className={`surface-card${toneClassName}${optionalClassName}`}>
      {eyebrow || title ? (
        <div className="surface-card__header">
          {eyebrow ? <span className="surface-card__eyebrow">{eyebrow}</span> : null}
          {title ? <h3 className="surface-card__title">{title}</h3> : null}
        </div>
      ) : null}
      <div className="surface-card__body">{children}</div>
    </article>
  );
}
