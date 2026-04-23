import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useProfileApi } from '@/features/profile/api/use-profile-api';
import {
  saveCurrentProfile,
  useCurrentProfile,
} from '@/features/profile/model/current-profile-store';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { DashboardIcon } from '@/shared/ui/dashboard-icon';
import { DashboardNotice } from '@/shared/ui/dashboard-notice';
import { DashboardPanel } from '@/shared/ui/dashboard-panel';

type ProfileLocationState = {
  flash?: 'profile-updated';
};

export function ProfilePage() {
  const profileApi = useProfileApi();
  const location = useLocation();
  const locationState = location.state as ProfileLocationState | null;
  const profile = useCurrentProfile();
  const [retryNonce, setRetryNonce] = useState(0);
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
  }, [profileApi, retryNonce]);

  const about = profile?.about ?? 'No bio added yet.';
  const dateOfBirth = profile?.dateOfBirth ?? 'Not specified';
  const age = profile?.age ?? 'Not specified';
  const showProfileUpdatedFeedback = locationState?.flash === 'profile-updated';

  return (
    <section className="dashboard-page">
      {showProfileUpdatedFeedback ? (
        <DashboardNotice
          description="Profile changes were saved and are already reflected in the protected workspace."
          title="Profile updated"
          tone="success"
        />
      ) : null}

      <DashboardPanel
        className="dashboard-home__hero"
        description="A compact account overview styled like the Figma banking dashboard, but limited to the real data and flows already present in the product."
        title={profile ? `Welcome back, ${profile.username}` : 'Preparing your workspace'}
      >
        {!profile && state.kind === 'loading' ? (
          <DashboardNotice
            description="Loading current account details from users-service."
            title="Loading profile"
            tone="info"
          />
        ) : null}

        {state.kind === 'error' ? (
          <DashboardNotice
            actions={(
              <button
                className="dashboard-secondary-button"
                onClick={() => setRetryNonce((value) => value + 1)}
                type="button"
              >
                Retry request
              </button>
            )}
            description={state.message}
            title={profile ? 'Profile refresh failed' : 'Profile is unavailable'}
            tone="error"
          />
        ) : null}

        {profile ? (
          <>
            <div className="dashboard-stat-grid">
              <article className="dashboard-stat-card">
                <div className="dashboard-stat-card__icon dashboard-stat-card__icon--blue">
                  <DashboardIcon name="user" />
                </div>
                <div>
                  <span className="dashboard-stat-card__label">Username</span>
                  <strong>{profile.username}</strong>
                </div>
              </article>
              <article className="dashboard-stat-card">
                <div className="dashboard-stat-card__icon dashboard-stat-card__icon--yellow">
                  <DashboardIcon name="mail" />
                </div>
                <div>
                  <span className="dashboard-stat-card__label">Email</span>
                  <strong>{profile.email}</strong>
                </div>
              </article>
              <article className="dashboard-stat-card">
                <div className="dashboard-stat-card__icon dashboard-stat-card__icon--pink">
                  <DashboardIcon name="calendar" />
                </div>
                <div>
                  <span className="dashboard-stat-card__label">Date of birth</span>
                  <strong>{dateOfBirth === 'Not specified' ? 'Not set' : dateOfBirth}</strong>
                </div>
              </article>
              <article className="dashboard-stat-card">
                <div className="dashboard-stat-card__icon dashboard-stat-card__icon--teal">
                  <DashboardIcon name="shield" />
                </div>
                <div>
                  <span className="dashboard-stat-card__label">Age</span>
                  <strong>{typeof age === 'number' ? age : 'Not set'}</strong>
                </div>
              </article>
            </div>

            <div className="dashboard-inline-actions">
              <Link
                className="dashboard-primary-button"
                to={ROUTE_PATHS.profileEdit}
              >
                Open settings
              </Link>
              <Link
                className="dashboard-secondary-button"
                to={ROUTE_PATHS.profilePassword}
              >
                Security
              </Link>
            </div>
          </>
        ) : null}
      </DashboardPanel>

      {profile ? (
        <div className="dashboard-grid dashboard-grid--two">
          <DashboardPanel
            description="The current authenticated user details coming from users-service."
            title="Account details"
          >
            <dl className="dashboard-detail-list">
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
                <dd>{typeof age === 'number' ? age : 'Not specified'}</dd>
              </div>
            </dl>
          </DashboardPanel>

          <DashboardPanel
            description="About text and account actions stay grouped in one secondary panel."
            title="Profile notes"
          >
            <p className="dashboard-copy-block">{about}</p>
            <div className="dashboard-inline-actions">
              <Link
                className="dashboard-secondary-button"
                to={ROUTE_PATHS.users}
              >
                Open users
              </Link>
              <Link
                className="dashboard-secondary-button dashboard-secondary-button--danger"
                to={ROUTE_PATHS.profileDelete}
              >
                Delete account
              </Link>
            </div>
          </DashboardPanel>
        </div>
      ) : null}
    </section>
  );
}
