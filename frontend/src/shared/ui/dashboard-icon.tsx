import type { SVGProps } from 'react';

type DashboardIconProps = SVGProps<SVGSVGElement> & {
  name:
    | 'home'
    | 'settings'
    | 'search'
    | 'bell'
    | 'logout'
    | 'user'
    | 'mail'
    | 'calendar'
    | 'shield'
    | 'lock';
};

export function DashboardIcon({
  name,
  className,
  ...props
}: DashboardIconProps) {
  const composedClassName = className
    ? `dashboard-icon ${className}`
    : 'dashboard-icon';

  return (
    <svg
      aria-hidden="true"
      className={composedClassName}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {name === 'home' ? (
        <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" />
      ) : null}
      {name === 'settings' ? (
        <>
          <circle cx="12" cy="12" r="3.25" />
          <path d="M12 3.5v2.1M12 18.4v2.1M20.5 12h-2.1M5.6 12H3.5M17.9 6.1l-1.5 1.5M7.6 16.4l-1.5 1.5M17.9 17.9l-1.5-1.5M7.6 7.6 6.1 6.1" />
          <circle cx="12" cy="12" r="7.15" />
        </>
      ) : null}
      {name === 'search' ? (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </>
      ) : null}
      {name === 'bell' ? (
        <>
          <path d="M9.5 19.5c.4 1.2 1.3 2 2.5 2s2.1-.8 2.5-2M6.5 17.5h11l-1.4-1.9v-4.1a4.1 4.1 0 1 0-8.2 0v4.1L6.5 17.5Z" />
        </>
      ) : null}
      {name === 'logout' ? (
        <>
          <path d="M9 20H5.5A2.5 2.5 0 0 1 3 17.5v-11A2.5 2.5 0 0 1 5.5 4H9" />
          <path d="M14 16.5 20.5 12 14 7.5M20 12H9" />
        </>
      ) : null}
      {name === 'user' ? (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19.5a7 7 0 0 1 14 0" />
        </>
      ) : null}
      {name === 'mail' ? (
        <>
          <rect width="18" height="13" x="3" y="5.5" rx="2.5" />
          <path d="m4.5 7 7.5 6 7.5-6" />
        </>
      ) : null}
      {name === 'calendar' ? (
        <>
          <rect width="18" height="15" x="3" y="6" rx="2.5" />
          <path d="M7.5 3.5v5M16.5 3.5v5M3 10.5h18" />
        </>
      ) : null}
      {name === 'shield' ? (
        <>
          <path d="M12 3.5 19 6v5.7c0 4.2-2.8 7.3-7 8.8-4.2-1.5-7-4.6-7-8.8V6l7-2.5Z" />
          <path d="m9.5 12 1.7 1.7 3.8-3.9" />
        </>
      ) : null}
      {name === 'lock' ? (
        <>
          <rect width="14" height="10" x="5" y="10" rx="2.5" />
          <path d="M8 10V7.8a4 4 0 1 1 8 0V10" />
        </>
      ) : null}
    </svg>
  );
}
