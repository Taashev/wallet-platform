import { DashboardIcon } from '@/shared/ui/dashboard-icon';

type DashboardUserAvatarProps = {
  size?: 'sm' | 'lg';
  ariaLabel?: string;
  className?: string;
};

export function DashboardUserAvatar({
  size = 'sm',
  ariaLabel = 'User avatar',
  className,
}: DashboardUserAvatarProps) {
  const composedClassName = [
    'dashboard-user-avatar',
    size === 'lg' ? 'dashboard-user-avatar--lg' : 'dashboard-user-avatar--sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      aria-label={ariaLabel}
      className={composedClassName}
    >
      <DashboardIcon
        className="dashboard-user-avatar__icon"
        name="user"
      />
    </div>
  );
}
