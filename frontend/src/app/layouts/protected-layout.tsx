import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthGuardStatus } from '@/app/layouts/auth-guard-status';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { DashboardIcon } from '@/shared/ui/dashboard-icon';
import { DashboardUserAvatar } from '@/shared/ui/dashboard-user-avatar';

const PROTECTED_NAV_ITEMS = [
	{ label: 'Home', to: ROUTE_PATHS.profile, icon: 'home' as const },
	{ label: 'Settings', to: ROUTE_PATHS.profileEdit, icon: 'settings' as const },
];

export function ProtectedLayout() {
  const authSession = useAuthSession();
  const location = useLocation();
	const isSettingsRoute =
		location.pathname.startsWith(ROUTE_PATHS.profileEdit) ||
		location.pathname.startsWith(ROUTE_PATHS.profilePassword) ||
		location.pathname.startsWith(ROUTE_PATHS.profileDelete);
	if (!authSession.isBootstrapped) {
		return (
			<AuthGuardStatus
				description='The app is restoring the auth snapshot before it decides whether protected routes can be rendered.'
				title='Restoring protected session'
			/>
		);
	}

	if (!authSession.isAuthenticated) {
		const redirectPath = `${location.pathname}${location.search}${location.hash}`;

		return <Navigate replace state={{ from: redirectPath }} to={ROUTE_PATHS.signIn} />;
	}

	return (
		<main className='dashboard-shell'>
			<aside className='dashboard-shell__sidebar'>
				<div className='dashboard-sidebar__brand'>
					<div className='dashboard-sidebar__brand-mark'>W</div>
					<div>
						<strong>Wallet Platform</strong>
					</div>
				</div>

				<nav aria-label='Primary navigation' className='dashboard-sidebar__nav'>
					{PROTECTED_NAV_ITEMS.map((item) => {
						const isActive =
							item.to === ROUTE_PATHS.profile ? location.pathname === ROUTE_PATHS.profile : isSettingsRoute;

						return (
							<NavLink
								className={`dashboard-sidebar__link${isActive ? ' dashboard-sidebar__link--active' : ''}`}
								key={item.to}
								to={item.to}
							>
								<DashboardIcon name={item.icon} />
								<span>{item.label}</span>
							</NavLink>
						);
					})}
				</nav>
			</aside>

			<section className='dashboard-shell__main'>
				<header className='dashboard-topbar'>
					<label className='dashboard-search'>
						<DashboardIcon name='search' />
						<input aria-label='Search' disabled placeholder='Search for something' type='text' />
					</label>

					<div className='dashboard-topbar__actions'>
						<button aria-label='Notifications' className='dashboard-topbar__icon-button' type='button'>
							<DashboardIcon name='bell' />
						</button>

						<DashboardUserAvatar ariaLabel='Current user' />
					</div>
				</header>

				<div className='dashboard-shell__content'>
					<Outlet />
				</div>
			</section>
		</main>
	);
}
