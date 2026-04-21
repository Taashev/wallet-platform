import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useProfileApi } from '@/features/profile/api/use-profile-api';
import {
  saveCurrentProfile,
  useCurrentProfile,
} from '@/features/profile/model/current-profile-store';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { ButtonLink } from '@/shared/ui/button-link';
import { FormFeedback } from '@/shared/ui/form-feedback';
import { SurfaceCard } from '@/shared/ui/surface-card';

type ProfileLocationState = {
  flash?: 'profile-updated';
};

export function ProfilePage() {
  const profileApi = useProfileApi();
  const location = useLocation();
  const locationState = location.state as ProfileLocationState | null;
  const profile = useCurrentProfile();
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'ready' }
    | { kind: 'error'; message: string }
  >(profile ? { kind: 'ready' } : { kind: 'loading' });

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setState({ kind: 'loading' });

      try {
        const nextProfile = await profileApi.getCurrentProfile();

        if (!isMounted) {
          return;
        }

        saveCurrentProfile(nextProfile);
        setState({ kind: 'ready' });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const usersServiceError = normalizeUsersServiceError(error);
        setState({
          kind: 'error',
          message: usersServiceError.message,
        });
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [profileApi]);

  const about = profile?.about ?? 'No bio added yet.';
  const dateOfBirth = profile?.dateOfBirth ?? 'Not specified';
  const age = profile?.age ?? 'Not specified';
  const showProfileUpdatedFeedback = locationState?.flash === 'profile-updated';

  return (
    <section className="profile-screen">
      {showProfileUpdatedFeedback ? (
        <FormFeedback
          description="Profile changes were saved and are already reflected in the protected workspace."
          state="success"
          title="Profile updated"
        />
      ) : null}

      <SurfaceCard
        className="profile-screen__hero"
        eyebrow="Current profile"
        title={profile ? `@${profile.username}` : 'Current profile'}
        tone="accent"
      >
        {!profile && state.kind === 'loading' ? (
          <FormFeedback
            description="Loading current account details from users-service."
            state="loading"
            title="Loading profile"
          />
        ) : null}

        {!profile && state.kind === 'error' ? (
          <FormFeedback
            description={state.message}
            state="error"
            title="Profile is unavailable"
          />
        ) : null}

        {profile ? (
          <>
            <p className="profile-screen__lead">
              Read-only account overview for the authenticated user. Edit, password and deletion flows stay on
              their dedicated routes.
            </p>

            <div className="metric-strip">
              <div className="metric-item">
                <strong>{profile.username}</strong>
                <span>Username</span>
              </div>
              <div className="metric-item">
                <strong>{typeof age === 'number' ? age : '—'}</strong>
                <span>Age</span>
              </div>
              <div className="metric-item">
                <strong>{dateOfBirth === 'Not specified' ? '—' : dateOfBirth}</strong>
                <span>Date of birth</span>
              </div>
            </div>

            <div className="profile-screen__actions">
              <ButtonLink to={ROUTE_PATHS.profileEdit}>Edit profile</ButtonLink>
              <ButtonLink
                to={ROUTE_PATHS.profilePassword}
                variant="secondary"
              >
                Change password
              </ButtonLink>
            </div>
          </>
        ) : null}
      </SurfaceCard>

      {profile ? (
        <div className="card-grid card-grid--two">
          <SurfaceCard
            eyebrow="Identity"
            title="Private account details"
          >
            <dl className="profile-screen__details">
              <div>
                <dt>Username</dt>
                <dd>{profile.username}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>Date of birth</dt>
                <dd>{dateOfBirth}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{typeof age === 'number' ? age : age}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="About"
            title="Public-facing bio"
          >
            <p className="profile-screen__about">{about}</p>
            <div className="profile-screen__secondary-actions">
              <ButtonLink
                to={ROUTE_PATHS.users}
                variant="secondary"
              >
                Open users
              </ButtonLink>
              <ButtonLink
                to={ROUTE_PATHS.profileDelete}
                variant="secondary"
              >
                Delete account
              </ButtonLink>
            </div>
          </SurfaceCard>
        </div>
      ) : null}
    </section>
  );
}
