import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useProfileApi } from '@/features/profile/api/use-profile-api';
import {
  saveCurrentProfile,
  useCurrentProfile,
} from '@/features/profile/model/current-profile-store';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { ButtonLink } from '@/shared/ui/button-link';
import { FormFeedback } from '@/shared/ui/form-feedback';
import { FormField } from '@/shared/ui/form-field';
import { FormSubmitButton } from '@/shared/ui/form-submit-button';
import { FormTextareaField } from '@/shared/ui/form-textarea-field';
import { SurfaceCard } from '@/shared/ui/surface-card';

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
  const navigate = useNavigate();
  const profileApi = useProfileApi();
  const profile = useCurrentProfile();
  const [formValues, setFormValues] = useState<EditProfileFormValues>(() =>
    profile ? createFormValuesFromProfile(profile) : createEmptyFormValues(),
  );
  const [fieldErrors, setFieldErrors] = useState<EditProfileFieldErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
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
      void navigate(ROUTE_PATHS.profile, {
        replace: true,
        state: { flash: 'profile-updated' },
      });
    } catch (error) {
      setSaveError(normalizeUsersServiceError(error).message);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
  }

  return (
    <section className="profile-edit-screen">
      <SurfaceCard
        eyebrow="Edit profile"
        title="Update account details"
        tone="accent"
      >
        <div className="profile-edit-screen__intro">
          <p>Only username, email, about and date of birth can be changed from this screen.</p>
          <ButtonLink
            to={ROUTE_PATHS.profile}
            variant="secondary"
          >
            Back to profile
          </ButtonLink>
        </div>

        {isLoading ? (
          <FormFeedback
            description="Loading current profile data before the form becomes editable."
            state="loading"
            title="Preparing edit form"
          />
        ) : null}

        {loadError ? (
          <FormFeedback
            description={loadError}
            state="error"
            title="Edit screen is unavailable"
          />
        ) : null}

        {!isLoading && !loadError ? (
          <form
            className="form-showcase"
            noValidate
            onSubmit={(submitEvent) => void handleSubmit(submitEvent)}
          >
            {saveError ? (
              <FormFeedback
                description={saveError}
                state="error"
                title="Profile was not saved"
              />
            ) : null}

            <div className="form-layout">
              <FormField
                disabled={isSaving}
                error={fieldErrors.username}
                label="Username"
                name="edit-profile-username"
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    username: event.target.value,
                  }))}
                placeholder="Choose a username"
                required
                value={formValues.username}
              />
              <FormField
                disabled={isSaving}
                error={fieldErrors.email}
                label="Email"
                name="edit-profile-email"
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    email: event.target.value,
                  }))}
                placeholder="name@example.com"
                required
                type="email"
                value={formValues.email}
              />
              <FormField
                disabled={isSaving}
                error={fieldErrors.dateOfBirth}
                hint="Optional. Use the same format expected by users-service."
                label="Date of birth"
                name="edit-profile-date-of-birth"
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    dateOfBirth: event.target.value,
                  }))}
                type="date"
                value={formValues.dateOfBirth}
              />
              <FormTextareaField
                disabled={isSaving}
                hint="Optional short bio shown in your public profile."
                label="About"
                name="edit-profile-about"
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    about: event.target.value,
                  }))}
                placeholder="Tell other users a little about yourself"
                rows={5}
                value={formValues.about}
              />
            </div>

            <div className="form-actions">
              <FormSubmitButton
                busy={isSaving}
                busyLabel="Saving profile…"
              >
                Save changes
              </FormSubmitButton>
            </div>
          </form>
        ) : null}
      </SurfaceCard>
    </section>
  );
}
