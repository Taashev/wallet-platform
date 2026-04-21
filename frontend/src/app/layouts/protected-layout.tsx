import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthGuardStatus } from '@/app/layouts/auth-guard-status';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';
import { clearCurrentProfile } from '@/features/profile/model/current-profile-store';

const PROTECTED_NAV_ITEMS = [
  { label: 'Profile', to: ROUTE_PATHS.profile },
  { label: 'Users', to: ROUTE_PATHS.users },
];

export function ProtectedLayout() {
  const authApi = useAuthApi();
  const authSession = useAuthSession();
  const location = useLocation();

  if (!authSession.isBootstrapped) {
    return (
      <AuthGuardStatus
        description="The app is restoring the auth snapshot before it decides whether protected routes can be rendered."
        title="Restoring protected session"
      />
    );
  }

  if (!authSession.isAuthenticated) {
    const redirectPath = `${location.pathname}${location.search}${location.hash}`;

    return (
      <Navigate
        replace
        state={{ from: redirectPath }}
        to={ROUTE_PATHS.signIn}
      />
    );
  }

  async function handleSignout() {
    try {
      await authApi.signout();
    } finally {
      clearCurrentProfile();
      authSession.clearSession();
    }
  }

  return (
    <main className="protected-shell">
      <section className="protected-shell__main">
        <header className="protected-shell__topbar">
          <div className="protected-shell__topbar-main">
            <div>
              <span className="hero-eyebrow">Protected area</span>
              <h1>Protected routes stay inside one responsive app shell.</h1>
            </div>
            <p className="protected-shell__topbar-copy">
              Profile and users routes share one primary navigation bar, while sign out stays available without
              breaking auth guards or smaller screens.
            </p>
          </div>

          <div className="protected-shell__topbar-actions">
            <nav
              aria-label="Protected routes"
              className="protected-shell__nav"
            >
              {PROTECTED_NAV_ITEMS.map((item) => (
                <NavLink
                  className={({ isActive }) => `protected-nav__link${isActive ? ' protected-nav__link--active' : ''}`}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="protected-shell__signout">
              <button
                className="connection-card__action connection-card__action--secondary"
                onClick={() => void handleSignout()}
                type="button"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="protected-shell__surface">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
