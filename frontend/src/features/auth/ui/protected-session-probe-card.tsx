import { useState } from 'react';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useUsersServiceHttpClient } from '@/app/providers/use-users-service-http-client';
import {
  normalizeCurrentUserDto,
  type CurrentUserResponseDto,
} from '@/shared/api/contracts/users-service-contract';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { SurfaceCard } from '@/shared/ui/surface-card';

type ProtectedSessionProbeState =
  | { status: 'idle'; message: string }
  | { status: 'loading'; message: string }
  | { status: 'success'; message: string; payload: unknown }
  | { status: 'error'; message: string; details: string };

function formatPayload(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function ProtectedSessionProbeCard() {
  const authSession = useAuthSession();
  const usersServiceHttpClient = useUsersServiceHttpClient();
  const [state, setState] = useState<ProtectedSessionProbeState>({
    status: 'idle',
    message: 'Protected route is ready to verify automatic refresh and fail-closed logout.',
  });

  async function handleProbe() {
    setState({
      status: 'loading',
      message: 'Loading current user through the protected users-service client.',
    });

    try {
      const response = await usersServiceHttpClient.get<CurrentUserResponseDto>('v1/users/me');
      const normalizedUser = normalizeCurrentUserDto(response);

      setState({
        status: 'success',
        message: 'Protected request completed through the orchestrated client.',
        payload: normalizedUser,
      });
    } catch (error) {
      const usersServiceError = normalizeUsersServiceError(error);

      setState({
        status: 'error',
        message: usersServiceError.message,
        details: `Normalized error: ${usersServiceError.code}${
          usersServiceError.status !== undefined ? ` · HTTP ${usersServiceError.status}` : ''
        }`,
      });
    }
  }

  return (
    <SurfaceCard
      eyebrow="Refresh orchestration"
      title="Protected requests can trigger refresh and retry"
    >
      <div className="protected-session-probe-card">
        <p>
          This route uses the shared protected client. If the access token is stale but
          the refresh token is still valid, the request should refresh once and retry automatically.
        </p>

        <div className="session-preview-card__grid">
          <div className="session-preview-card__panel">
            <strong>Session snapshot</strong>
            <pre>
              {formatPayload({
                isAuthenticated: authSession.isAuthenticated,
                storageKind: authSession.storageKind,
                hasSession: authSession.session !== null,
              })}
            </pre>
          </div>

          <div className="session-preview-card__panel">
            <strong>Latest probe result</strong>
            <pre>
              {formatPayload(
                state.status === 'success'
                  ? state.payload
                  : {
                      status: state.status,
                      message: state.message,
                    },
              )}
            </pre>
          </div>
        </div>

        <div className="session-preview-card__actions">
          <button
            className="connection-card__action"
            disabled={state.status === 'loading'}
            onClick={() => void handleProbe()}
            type="button"
          >
            Load current user via protected client
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
