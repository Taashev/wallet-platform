import { NavLink, Outlet } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';

const PROTECTED_NAV_ITEMS = [
  { label: 'Profile', to: ROUTE_PATHS.profile },
  { label: 'Edit profile', to: ROUTE_PATHS.profileEdit },
  { label: 'Password', to: ROUTE_PATHS.profilePassword },
  { label: 'Users', to: ROUTE_PATHS.users },
  { label: 'Delete account', to: ROUTE_PATHS.profileDelete },
];

export function ProtectedLayout() {
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
          Route grouping is in place now. Actual authorization guard and session bootstrap will be attached in
          `TASK-010`.
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
