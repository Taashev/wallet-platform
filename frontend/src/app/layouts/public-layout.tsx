import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthGuardStatus } from '@/app/layouts/auth-guard-status';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';

const PUBLIC_NAV_ITEMS = [
  { label: 'Sign in', to: ROUTE_PATHS.signIn },
  { label: 'Sign up', to: ROUTE_PATHS.signUp },
];

export function PublicLayout() {
  const authSession = useAuthSession();
  const location = useLocation();
  const redirectTarget =
    typeof location.state?.from === 'string'
      ? location.state.from
      : ROUTE_PATHS.profile;

  if (!authSession.isBootstrapped) {
    return (
      <AuthGuardStatus
        description="The app is restoring the persisted auth snapshot before rendering public entry routes."
        title="Checking existing session"
      />
    );
  }

  if (authSession.isAuthenticated) {
    return (
      <Navigate
        replace
        state={null}
        to={redirectTarget}
      />
    );
  }

  return (
    <main className="public-shell">
      <section className="public-shell__body">
        <section className="public-shell__panel public-shell__panel--single">
          <nav
            aria-label="Public routes"
            className="shell-tabs shell-tabs--status public-shell__tabs"
          >
            {PUBLIC_NAV_ITEMS.map((item) => (
              <NavLink
                className={({ isActive }) => `shell-tab shell-tab--status${isActive ? ' shell-tab--active' : ''}`}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Outlet />
        </section>
      </section>
    </main>
  );
}
