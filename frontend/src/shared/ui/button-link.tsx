import type { PropsWithChildren } from 'react';

type ButtonLinkProps = PropsWithChildren<{
  href: string;
  variant?: 'primary' | 'secondary';
}>;

export function ButtonLink({
  href,
  variant = 'primary',
  children,
}: ButtonLinkProps) {
  return (
    <a
      className={`button-link button-link--${variant}`}
      href={href}
    >
      {children}
    </a>
  );
}
