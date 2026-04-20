import { NavLink, Outlet } from 'react-router-dom';
import { ButtonLink } from '@/shared/ui/button-link';
import { ROUTE_PATHS } from '@/app/router/route-paths';

const PUBLIC_NAV_ITEMS = [
  { label: 'Sign in', to: ROUTE_PATHS.signIn },
  { label: 'Sign up', to: ROUTE_PATHS.signUp },
];

export function PublicLayout() {
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
            <li>Actual sign-in and sign-up logic stays isolated for later feature tasks.</li>
          </ul>

          <div className="hero-actions">
            <ButtonLink to={ROUTE_PATHS.signUp}>Open sign up</ButtonLink>
            <ButtonLink
              to={ROUTE_PATHS.profile}
              variant="secondary"
            >
              Preview protected shell
            </ButtonLink>
          </div>
        </section>

        <section className="public-shell__panel">
          <Outlet />
        </section>
      </section>
    </main>
  );
}
