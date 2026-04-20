import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthGuardStatus } from '@/app/layouts/auth-guard-status';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';

const PROTECTED_NAV_ITEMS = [
  { label: 'Profile', to: ROUTE_PATHS.profile },
  { label: 'Edit profile', to: ROUTE_PATHS.profileEdit },
  { label: 'Password', to: ROUTE_PATHS.profilePassword },
  { label: 'Users', to: ROUTE_PATHS.users },
  { label: 'Delete account', to: ROUTE_PATHS.profileDelete },
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
      authSession.clearSession();
    }
  }

  return (
    <main className="protected-shell">
      <aside className="protected-shell__sidebar">
        <div className="protected-shell__brand">
          <div className="brand-mark">
            <span
              aria-hidden="true"
              className="brand-mark__icon"
            >
              U
            </span>
            <div className="brand-mark__copy">
              <span className="brand-mark__title">Users Service Web</span>
              <span className="brand-mark__caption">Protected routes shell</span>
            </div>
          </div>
          <span className="mini-label">Protected area</span>
        </div>
        <p className="protected-shell__note">
          Protected routes now wait for auth bootstrap and redirect unauthenticated traffic back to the sign-in
          flow.
        </p>

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
      </aside>

      <section className="protected-shell__main">
        <header className="protected-shell__topbar">
          <div>
            <span className="hero-eyebrow">App shell</span>
            <h1>Protected routes use a different layout wrapper.</h1>
          </div>
          <p className="protected-shell__topbar-copy">
            Navigation, section framing and future action slots are centralized here instead of being duplicated in
            each screen.
          </p>
        </header>

        <div className="protected-shell__surface">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
