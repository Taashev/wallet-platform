import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';
import { markPostLogoutRedirectToHome } from '@/features/auth/model/post-logout-redirect';
import { clearCurrentProfile } from '@/features/profile/model/current-profile-store';

export function SettingsSignoutButton() {
  const authApi = useAuthApi();
  const authSession = useAuthSession();
  const navigate = useNavigate();

  async function handleSignout() {
    try {
      await authApi.signout();
    } finally {
      markPostLogoutRedirectToHome();
      clearCurrentProfile();
      authSession.clearSession();

      if (typeof window !== 'undefined') {
        window.location.replace(ROUTE_PATHS.signIn);
        return;
      }

      void navigate(ROUTE_PATHS.signIn, { replace: true });
    }
  }

  return (
    <button
      className="dashboard-secondary-button settings-tabs__action"
      onClick={() => void handleSignout()}
      type="button"
    >
      Sign out
    </button>
  );
}
