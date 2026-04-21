import { NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthGuardStatus } from '@/app/layouts/auth-guard-status';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { SignInPage } from '@/pages/sign-in';
import { SignUpPage } from '@/pages/sign-up';

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
  const isSignUpRoute = location.pathname === ROUTE_PATHS.signUp;

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
    <main className="auth-shell">
      <section className="auth-shell__brand-panel">
        <div className="auth-shell__brand-copy">
          <div className="auth-shell__brand-lockup">
            <div className="auth-shell__brand-mark">W</div>
            <span className="auth-shell__eyebrow">
              <span>Wallet</span>
              <span>Platform</span>
            </span>
          </div>
        </div>
        <div className="auth-shell__content">
          <nav
            aria-label="Public routes"
            className="auth-shell__switcher"
          >
            {PUBLIC_NAV_ITEMS.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `auth-shell__switcher-tab${isActive ? ' auth-shell__switcher-tab--active' : ''}`
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="auth-shell__form-stage">
            <div
              aria-hidden={isSignUpRoute}
              className={`auth-shell__form-pane auth-shell__form-pane--sign-in${!isSignUpRoute ? ' auth-shell__form-pane--active' : ''}`}
              data-testid="auth-pane-sign-in"
            >
              <SignInPage />
            </div>
            <div
              aria-hidden={!isSignUpRoute}
              className={`auth-shell__form-pane auth-shell__form-pane--sign-up${isSignUpRoute ? ' auth-shell__form-pane--active' : ''}`}
              data-testid="auth-pane-sign-up"
            >
              <SignUpPage />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
