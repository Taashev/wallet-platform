import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useProfileApi } from '@/features/profile/api/use-profile-api';
import {
  saveCurrentProfile,
  useCurrentProfile,
} from '@/features/profile/model/current-profile-store';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { DashboardField } from '@/shared/ui/dashboard-field';
import { DashboardNotice } from '@/shared/ui/dashboard-notice';
import { DashboardPanel } from '@/shared/ui/dashboard-panel';
import { DashboardUserAvatar } from '@/shared/ui/dashboard-user-avatar';
import { SettingsTabs } from '@/shared/ui/settings-tabs';

type EditProfileFormValues = {
  username: string;
  email: string;
  about: string;
  dateOfBirth: string;
};

type EditProfileFieldErrors = Partial<Record<keyof EditProfileFormValues, string>>;

function createEmptyFormValues(): EditProfileFormValues {
  return {
    username: '',
    email: '',
    about: '',
    dateOfBirth: '',
  };
}

function createFormValuesFromProfile(profile: {
  username: string;
  email: string;
  about: string | null;
  dateOfBirth: string | null;
}): EditProfileFormValues {
  return {
    username: profile.username,
    email: profile.email,
    about: profile.about ?? '',
    dateOfBirth: profile.dateOfBirth ?? '',
  };
}

function validateEditProfileForm(values: EditProfileFormValues): EditProfileFieldErrors {
  const normalizedUsername = values.username.trim();
  const normalizedEmail = values.email.trim();
  const normalizedDateOfBirth = values.dateOfBirth.trim();

  return {
    username: normalizedUsername ? undefined : 'Username is required.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      ? undefined
      : 'Enter a valid email address.',
    dateOfBirth:
      !normalizedDateOfBirth || /^\d{4}-\d{2}-\d{2}$/.test(normalizedDateOfBirth)
        ? undefined
        : 'Use YYYY-MM-DD format.',
  };
}

export function ProfileEditPage() {
  const profileApi = useProfileApi();
  const profile = useCurrentProfile();
  const [formValues, setFormValues] = useState<EditProfileFormValues>(() =>
    profile ? createFormValuesFromProfile(profile) : createEmptyFormValues(),
  );
  const [fieldErrors, setFieldErrors] = useState<EditProfileFieldErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(profile === null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormValues(createFormValuesFromProfile(profile));
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
        setFormValues(createFormValuesFromProfile(nextProfile));
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

    const nextFieldErrors = validateEditProfileForm(formValues);
    setFieldErrors(nextFieldErrors);
    setSaveError(null);
    setSaveSuccess(null);

    if (nextFieldErrors.username || nextFieldErrors.email || nextFieldErrors.dateOfBirth) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile = await profileApi.updateCurrentProfile({
        username: formValues.username.trim(),
        email: formValues.email.trim(),
        about: formValues.about.trim(),
        dateOfBirth: formValues.dateOfBirth.trim(),
      });

      saveCurrentProfile(updatedProfile);
      setSaveSuccess('Profile details were saved. Home already uses the updated data.');
    } catch (error) {
      setSaveError(normalizeUsersServiceError(error).message);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
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

        {isLoading ? (
          <DashboardNotice
            description="Loading current profile data before the form becomes editable."
            title="Preparing edit form"
            tone="info"
          />
        ) : null}

        {loadError ? (
          <DashboardNotice
            description={loadError}
            title="Edit screen is unavailable"
            tone="error"
          />
        ) : null}

        {!isLoading && !loadError ? (
          <div className="settings-layout">
            <aside className="settings-profile-card">
              <DashboardUserAvatar size="lg" />
            </aside>

            <form
              className="dashboard-form"
              noValidate
              onSubmit={(submitEvent) => void handleSubmit(submitEvent)}
            >
              {saveSuccess ? (
                <DashboardNotice
                  description={saveSuccess}
                  title="Profile saved"
                  tone="success"
                />
              ) : null}
              {saveError ? (
                <DashboardNotice
                  description={saveError}
                  title="Profile was not saved"
                  tone="error"
                />
              ) : null}

              <div className="dashboard-form__grid dashboard-form__grid--two">
                <DashboardField
                  disabled={isSaving}
                  error={fieldErrors.username}
                  inputProps={{
                    placeholder: 'Visible username',
                    type: 'text',
                  }}
                  label="User Name"
                  name="edit-profile-username-secondary"
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      username: event.target.value,
                    }))}
                  required
                  value={formValues.username}
                />
                <DashboardField
                  disabled={isSaving}
                  error={fieldErrors.email}
                  inputProps={{
                    placeholder: 'name@example.com',
                    type: 'email',
                  }}
                  label="Email"
                  name="edit-profile-email"
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      email: event.target.value,
                    }))}
                  required
                  value={formValues.email}
                />
                <DashboardField
                  disabled={isSaving}
                  error={fieldErrors.dateOfBirth}
                  inputProps={{
                    type: 'date',
                  }}
                  label="Date of Birth"
                  name="edit-profile-date-of-birth"
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      dateOfBirth: event.target.value,
                    }))}
                  value={formValues.dateOfBirth}
                />
              </div>

              <DashboardField
                disabled={isSaving}
                label="About"
                multiline
                name="edit-profile-about"
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    about: event.target.value,
                  }))}
                textareaProps={{
                  placeholder: 'Tell other users a little about yourself',
                  rows: 5,
                }}
                value={formValues.about}
              />

              <div className="dashboard-form__actions dashboard-form__actions--end">
                <button
                  className="dashboard-primary-button"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </DashboardPanel>
    </section>
  );
}
