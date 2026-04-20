import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthGuardStatus } from '@/app/layouts/auth-guard-status';
import { ButtonLink } from '@/shared/ui/button-link';
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
      <header className="app-shell__header">
        <div className="brand-mark">
          <span
            aria-hidden="true"
            className="brand-mark__icon"
          >
            U
          </span>
          <div className="brand-mark__copy">
            <span className="brand-mark__title">Users Service Web</span>
            <span className="brand-mark__caption">Public routes shell</span>
          </div>
        </div>
        <span className="app-shell__status">Public layout</span>
      </header>

      <section className="public-shell__body">
        <section className="public-shell__intro">
          <span className="hero-eyebrow">Public routes</span>
          <h1>Entry flows now live inside a dedicated shell.</h1>
          <p className="hero-description">
            Router infrastructure is wired for sign in and sign up without coupling these screens to future auth
            session logic. The shell owns navigation, visual framing and responsive layout only.
          </p>

          <nav
            aria-label="Public routes"
            className="shell-tabs"
          >
            {PUBLIC_NAV_ITEMS.map((item) => (
              <NavLink
                className={({ isActive }) => `shell-tab${isActive ? ' shell-tab--active' : ''}`}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <ul className="hero-highlights">
            <li>Shared public framing keeps auth screens visually consistent from the start.</li>
            <li>Route transitions already happen through the client router without page reload.</li>
            <li>Sign-in and sign-up now use the shared auth/session flow instead of preview-only placeholders.</li>
          </ul>

          <div className="hero-actions">
            <ButtonLink to={ROUTE_PATHS.signUp}>Open sign up</ButtonLink>
          </div>
        </section>

        <section className="public-shell__panel">
          <Outlet />
        </section>
      </section>
    </main>
  );
}
