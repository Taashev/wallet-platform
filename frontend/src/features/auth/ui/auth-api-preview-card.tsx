import { useState } from 'react';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';
import {
  normalizeUsersServiceError,
  type UsersServiceError,
} from '@/shared/api/users-service-error';
import { SurfaceCard } from '@/shared/ui/surface-card';

type AuthApiPreviewState =
  | { status: 'idle'; message: string }
  | { status: 'loading'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; details: string };

export function AuthApiPreviewCard() {
  const authApi = useAuthApi();
  const authSession = useAuthSession();
  const [state, setState] = useState<AuthApiPreviewState>({
    status: 'idle',
    message: 'Refresh and signout previews are wired through the auth API module.',
  });

  async function handleRefreshPreview() {
    if (!authSession.session) {
      return;
    }

    setState({
      status: 'loading',
      message: 'Refreshing auth session through the auth API module.',
    });

    try {
      const nextSession = await authApi.refresh({
        refreshToken: authSession.session.refreshToken,
      });
      authSession.saveSession(nextSession);

      setState({
        status: 'success',
        message: 'Auth session was refreshed through the auth API module.',
      });
    } catch (error) {
      const usersServiceError = normalizeUsersServiceError(error);

      setState({
        status: 'error',
        message: usersServiceError.message,
        details: formatErrorDetails(usersServiceError),
      });
    }
  }

  async function handleSignoutPreview() {
    if (!authSession.session) {
      return;
    }

    setState({
      status: 'loading',
      message: 'Signing out through the auth API module.',
    });

    try {
      await authApi.signout();
      authSession.clearSession();

      setState({
        status: 'success',
        message: 'Current session was cleared through the auth API module.',
      });
    } catch (error) {
      const usersServiceError = normalizeUsersServiceError(error);

      setState({
        status: 'error',
        message: usersServiceError.message,
        details: formatErrorDetails(usersServiceError),
      });
    }
  }

  return (
    <SurfaceCard
      eyebrow="Auth API"
      title="Auth routes use one integration module"
    >
      <div className="auth-api-preview-card">
        <p>
          Sign-in, sign-up, refresh and signout are now grouped into one auth integration layer,
          so screens can call domain methods instead of building HTTP requests manually.
        </p>

        <div className="auth-api-preview-card__chips">
          <span>signup()</span>
          <span>signin()</span>
          <span>refresh()</span>
          <span>signout()</span>
        </div>

        <div className="session-preview-card__actions">
          <button
            className="connection-card__action"
            disabled={!authSession.session || state.status === 'loading'}
            onClick={() => void handleRefreshPreview()}
            type="button"
          >
            Refresh via auth API
          </button>
          <button
            className="connection-card__action connection-card__action--secondary"
            disabled={!authSession.session || state.status === 'loading'}
            onClick={() => void handleSignoutPreview()}
            type="button"
          >
            Sign out via auth API
          </button>
        </div>

        <div className={`auth-api-preview-card__status auth-api-preview-card__status--${state.status}`}>
          <p>{state.message}</p>
          {state.status === 'error' ? <p>{state.details}</p> : null}
        </div>
      </div>
    </SurfaceCard>
  );
}

function formatErrorDetails(error: UsersServiceError) {
  const details = [`Normalized error: ${error.code}`];

  if (error.status !== undefined) {
    details.push(`HTTP ${error.status}`);
  }

  return details.join(' · ');
}
