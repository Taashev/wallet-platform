import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';
import { clearCurrentProfile } from '@/features/profile/model/current-profile-store';

export function SettingsSignoutButton() {
  const authApi = useAuthApi();
  const authSession = useAuthSession();

  async function handleSignout() {
    try {
      await authApi.signout();
    } finally {
      clearCurrentProfile();
      authSession.clearSession();
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
