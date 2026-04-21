import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useProfileApi } from '@/features/profile/api/use-profile-api';
import {
  clearCurrentProfile,
  saveCurrentProfile,
  useCurrentProfile,
} from '@/features/profile/model/current-profile-store';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { DashboardField } from '@/shared/ui/dashboard-field';
import { DashboardNotice } from '@/shared/ui/dashboard-notice';
import { DashboardPanel } from '@/shared/ui/dashboard-panel';
import { SettingsSignoutButton } from '@/shared/ui/settings-signout-button';
import { SettingsTabs } from '@/shared/ui/settings-tabs';

export function ProfileDeletePage() {
  const authSession = useAuthSession();
  const navigate = useNavigate();
  const profileApi = useProfileApi();
  const profile = useCurrentProfile();
  const [confirmationValue, setConfirmationValue] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(profile === null);
  const [isDeleting, setIsDeleting] = useState(false);
  const expectedConfirmation = profile?.username ?? '';

  useEffect(() => {
    if (profile) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const nextProfile = await profileApi.getCurrentProfile();

        if (!isMounted) {
          return;
        }

        saveCurrentProfile(nextProfile);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(normalizeUsersServiceError(error).message);
        setIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [profile, profileApi]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmError(null);

    const trimmedConfirmation = confirmationValue.trim();

    if (!expectedConfirmation) {
      setConfirmError('Current account details are unavailable. Reload the page before deleting the account.');
      return;
    }

    if (trimmedConfirmation !== expectedConfirmation) {
      setConfirmError(`Type ${expectedConfirmation} exactly to confirm account deletion.`);
      return;
    }

    setIsDeleting(true);

    try {
      await profileApi.deleteCurrentProfile();
      clearCurrentProfile();
      authSession.clearSession();
      await navigate(ROUTE_PATHS.signIn, { replace: true });
    } catch (error) {
      setConfirmError(normalizeUsersServiceError(error).message);
      setIsDeleting(false);
    }
  }

  return (
    <section className="dashboard-page">
      <DashboardPanel className="settings-workspace">
        <SettingsTabs
          action={<SettingsSignoutButton />}
          tabs={[
            { label: 'Edit profile', to: ROUTE_PATHS.profileEdit },
            { label: 'Security', to: ROUTE_PATHS.profilePassword },
            { label: 'Delete account', to: ROUTE_PATHS.profileDelete },
          ]}
        />

        {isLoading ? (
          <DashboardNotice
            description="Loading current account data before destructive confirmation can be unlocked."
            title="Preparing deletion flow"
            tone="info"
          />
        ) : null}

        {loadError ? (
          <DashboardNotice
            description={loadError}
            title="Delete flow is unavailable"
            tone="error"
          />
        ) : null}

        {!isLoading && !loadError ? (
          <div className="settings-layout settings-layout--security">
            <form
              className="dashboard-form"
              noValidate
              onSubmit={(submitEvent) => void handleSubmit(submitEvent)}
            >
              <DashboardNotice
                description="This action cannot be undone. Type your current username before continuing."
                title="Danger zone"
                tone="error"
              />

              <div className="settings-danger-list">
                <div>
                  <strong>Account access ends immediately</strong>
                  <p>After deletion, protected routes become unavailable until a different account signs in.</p>
                </div>
                <div>
                </div>
              </div>

              <DashboardField
                disabled={isDeleting}
                error={confirmError?.startsWith('Type ') ? confirmError : undefined}
                hint={`Type ${expectedConfirmation} to confirm this irreversible action.`}
                inputProps={{
                  autoComplete: 'off',
                  placeholder: expectedConfirmation,
                  type: 'text',
                }}
                label="Confirm Username"
                name="confirm-delete-username"
                onChange={(event) => setConfirmationValue(event.target.value)}
                required
                value={confirmationValue}
              />

              {confirmError && !confirmError.startsWith('Type ') ? (
                <DashboardNotice
                  description={confirmError}
                  title="Account was not deleted"
                  tone="error"
                />
              ) : null}

              <div className="dashboard-form__actions dashboard-form__actions--end">
                <button
                  className="dashboard-secondary-button dashboard-secondary-button--danger"
                  disabled={isDeleting}
                  type="submit"
                >
                  {isDeleting ? 'Deleting…' : 'Delete account'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </DashboardPanel>
    </section>
  );
}
