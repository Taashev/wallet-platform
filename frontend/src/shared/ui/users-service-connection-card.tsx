import { useEffect, useState } from 'react';
import { useAppConfig } from '@/app/providers/use-app-config';
import { useUsersServiceHttpClient } from '@/app/providers/use-users-service-http-client';
import { HttpClientError } from '@/shared/api/http-client';
import { resolveUsersServiceUrl } from '@/shared/config/app-config';
import { SurfaceCard } from '@/shared/ui/surface-card';

type ProbeState =
  | { status: 'loading'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

const USERS_SERVICE_PROBE_PATH = 'docs/v1';

export function UsersServiceConnectionCard() {
  const { usersService } = useAppConfig();
  const usersServiceHttpClient = useUsersServiceHttpClient();
  const [probeAttempt, setProbeAttempt] = useState(0);
  const [probeState, setProbeState] = useState<ProbeState>({
    status: 'loading',
    message: 'Checking users-service reachability via API base URL.',
  });

  const probeUrl = resolveUsersServiceUrl(
    usersService.apiBaseUrl,
    USERS_SERVICE_PROBE_PATH,
  );

  useEffect(() => {
    const abortController = new AbortController();

    async function probeUsersService() {
      setProbeState({
        status: 'loading',
        message: 'Checking users-service reachability via API base URL.',
      });

      try {
        await usersServiceHttpClient.get<void>(USERS_SERVICE_PROBE_PATH, {
          cache: 'no-store',
          isResponseSuccessful: (response) => response.ok || response.type === 'opaque',
          mode: 'no-cors',
          parseAs: 'none',
          signal: abortController.signal,
        });

        setProbeState({
          status: 'success',
          message: 'Users-service probe request reached the configured backend URL.',
        });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const fallbackMessage =
          error instanceof HttpClientError
            ? `${error.message} (${error.method} ${error.url})`
            : error instanceof Error && error.message
            ? error.message
            : 'Network access to the configured users-service URL failed.';

        setProbeState({
          status: 'error',
          message: fallbackMessage,
        });
      }
    }

    void probeUsersService();

    return () => {
      abortController.abort();
    };
  }, [probeAttempt, probeUrl, usersServiceHttpClient]);

  return (
    <SurfaceCard
      eyebrow="Users service connection"
      title="Frontend API base URL is centralized and probed from env"
      tone={probeState.status === 'error' ? 'accent' : 'default'}
    >
      <div className="connection-card">
        <div className="connection-card__row">
          <span className="connection-card__label">Configured base URL</span>
          <code>{usersService.apiBaseUrl}</code>
        </div>
      <div className="connection-card__row">
        <span className="connection-card__label">Resolved probe URL</span>
        <code>{probeUrl}</code>
      </div>
        <div className="connection-card__row">
          <span className="connection-card__label">Client layer</span>
          <code>shared/api/users-service-http-client.ts</code>
        </div>
        <div className="connection-card__row">
          <span className="connection-card__label">Env source</span>
          <code>{usersService.envKey}</code>
        </div>

        <div className="connection-card__status">
          <span className={`connection-card__dot connection-card__dot--${probeState.status}`} />
          <p>{probeState.message}</p>
        </div>

        <button
          className="connection-card__action"
          onClick={() => setProbeAttempt((value) => value + 1)}
          type="button"
        >
          Retry connection check
        </button>
      </div>
    </SurfaceCard>
  );
}
