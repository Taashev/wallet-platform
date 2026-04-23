import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';
import { markPostLogoutRedirectToHome } from '@/features/auth/model/post-logout-redirect';
import { clearCurrentProfile } from '@/features/profile/model/current-profile-store';
import { DashboardIcon } from '@/shared/ui/dashboard-icon';

export function TopbarSignoutButton() {
  const authApi = useAuthApi();
  const authSession = useAuthSession();
  const navigate = useNavigate();

  async function handleSignout() {
    try {
      await authApi.signout();
    } catch {
      // Fail closed on sign-out: local auth state must still be cleared.
    }

    markPostLogoutRedirectToHome();
    clearCurrentProfile();
    authSession.clearSession();

    if (typeof window !== 'undefined') {
      window.location.replace(ROUTE_PATHS.signIn);
      return;
    }

    void navigate(ROUTE_PATHS.signIn, { replace: true });
  }

  return (
    <button
      aria-label="Sign out"
      className="dashboard-topbar__icon-button dashboard-topbar__icon-button--signout"
      onClick={() => void handleSignout()}
      type="button"
    >
      <DashboardIcon name="logout" />
    </button>
  );
}
