import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

type ButtonLinkBaseProps = PropsWithChildren<{
  href: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}>;

type RouterButtonLinkProps = PropsWithChildren<{
  to: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}>;

type ButtonLinkProps = ButtonLinkBaseProps | RouterButtonLinkProps;

export function ButtonLink(props: ButtonLinkProps) {
  const {
    variant = 'primary',
    className,
    children,
  } = props;
  const composedClassName = className ? `button-link button-link--${variant} ${className}` : `button-link button-link--${variant}`;

  if ('to' in props) {
    return (
      <Link
        className={composedClassName}
        to={props.to}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      className={composedClassName}
      href={props.href}
    >
      {children}
    </a>
  );
}
