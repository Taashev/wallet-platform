import type { FormEvent } from 'react';
import { useState } from 'react';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useProfileApi } from '@/features/profile/api/use-profile-api';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { DashboardField } from '@/shared/ui/dashboard-field';
import { DashboardNotice } from '@/shared/ui/dashboard-notice';
import { DashboardPanel } from '@/shared/ui/dashboard-panel';
import { SettingsTabs } from '@/shared/ui/settings-tabs';

export function ProfilePasswordPage() {
  const profileApi = useProfileApi();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
  }>({});
  const [status, setStatus] = useState<{
    kind: 'idle' | 'submitting' | 'success' | 'error';
    title?: string;
    description?: string;
  }>({ kind: 'idle' });

  function handlePasswordChange(field: 'oldPassword' | 'newPassword', value: string) {
    if (field === 'oldPassword') {
      setOldPassword(value);
    }

    if (field === 'newPassword') {
      setNewPassword(value);
    }

    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }

    if (status.kind === 'error' || status.kind === 'success') {
      setStatus({ kind: 'idle' });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors = {
      oldPassword: oldPassword ? undefined : 'Current password is required.',
      newPassword: newPassword.length >= 8
        ? oldPassword === newPassword
          ? 'New password must be different.'
          : undefined
        : 'New password must be at least 8 characters long.',
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.oldPassword || nextFieldErrors.newPassword) {
      setStatus({
        kind: 'error',
        title: 'Security form is incomplete',
        description: 'Fix the highlighted password fields before saving.',
      });
      return;
    }

    setStatus({
      kind: 'submitting',
      title: 'Updating password',
      description: 'Sending the security update to users-service.',
    });

    try {
      await profileApi.changePassword({
        oldPassword,
        newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setStatus({
        kind: 'success',
        title: 'Password updated',
        description: 'Use the new password the next time you sign in.',
      });
    } catch (error) {
      setStatus({
        kind: 'error',
        title: 'Password was not updated',
        description: normalizeUsersServiceError(error).message,
      });
    }
  }

  return (
    <section className="dashboard-page">
      <DashboardPanel className="settings-workspace">
        <SettingsTabs
          tabs={[
            { label: 'Edit profile', to: ROUTE_PATHS.profileEdit },
            { label: 'Security', to: ROUTE_PATHS.profilePassword },
            { label: 'Delete account', to: ROUTE_PATHS.profileDelete },
          ]}
        />

        <div className="settings-layout settings-layout--security">
          <form
            aria-busy={status.kind === 'submitting'}
            className="dashboard-form"
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
          >
            {status.kind !== 'idle' ? (
              <DashboardNotice
                description={status.description!}
                title={status.title!}
                tone={
                  status.kind === 'success'
                    ? 'success'
                    : status.kind === 'submitting'
                      ? 'info'
                      : 'error'
                }
              />
            ) : null}

            <div className="dashboard-form__grid">
              <DashboardField
                disabled={status.kind === 'submitting'}
                error={fieldErrors.oldPassword}
                hint="Enter the password you use right now."
                inputProps={{
                  autoComplete: 'current-password',
                  autoFocus: true,
                  placeholder: 'Enter current password',
                  type: 'password',
                }}
                label="Current Password"
                name="current-password"
                onChange={(event) => handlePasswordChange('oldPassword', event.target.value)}
                required
                value={oldPassword}
              />
              <DashboardField
                disabled={status.kind === 'submitting'}
                error={fieldErrors.newPassword}
                hint="Use at least 8 characters and avoid repeating the old password."
                inputProps={{
                  autoComplete: 'new-password',
                  placeholder: 'Create new password',
                  type: 'password',
                }}
                label="New Password"
                name="new-password"
                onChange={(event) => handlePasswordChange('newPassword', event.target.value)}
                required
                value={newPassword}
              />
            </div>

            <div className="dashboard-form__actions dashboard-form__actions--end">
              <button
                className="dashboard-primary-button"
                disabled={status.kind === 'submitting'}
                type="submit"
              >
                {status.kind === 'submitting' ? 'Saving new password…' : 'Save new password'}
              </button>
            </div>
          </form>
        </div>
      </DashboardPanel>
    </section>
  );
}
