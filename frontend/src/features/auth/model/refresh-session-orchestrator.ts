import type { AuthSessionStore } from '@/entities/auth/model/auth-session-store';
import type { AuthApi } from '@/features/auth/api/auth-api';
import type { RetryContext } from '@/shared/api/http-client';

const AUTH_ROUTE_PREFIX = 'v1/auth/';

type RefreshSessionOrchestratorOptions = {
  authApi: AuthApi;
  authSessionStore: AuthSessionStore;
};

export function createRefreshSessionOrchestrator({
  authApi,
  authSessionStore,
}: RefreshSessionOrchestratorOptions) {
  let activeRefreshPromise: Promise<boolean> | null = null;
  let latestRefreshPromise: Promise<boolean> | null = null;

  function shouldHandleUnauthorized(context: RetryContext) {
    return context.response?.status === 401 && !context.path.startsWith(AUTH_ROUTE_PREFIX);
  }

  function ensureSessionRefreshed() {
    if (activeRefreshPromise) {
      return activeRefreshPromise;
    }

    const session = authSessionStore.getSession();

    if (!session) {
      authSessionStore.clearSession();
      const failedRefreshPromise = Promise.resolve(false);
      latestRefreshPromise = failedRefreshPromise;
      return failedRefreshPromise;
    }

    const refreshPromise = (async () => {
      try {
        const nextSession = await authApi.refresh({
          refreshToken: session.refreshToken,
        });
        authSessionStore.saveSession(nextSession);
        return true;
      } catch {
        authSessionStore.clearSession();
        return false;
      }
    })();

    activeRefreshPromise = refreshPromise;
    latestRefreshPromise = refreshPromise;
    void refreshPromise.finally(() => {
      if (activeRefreshPromise === refreshPromise) {
        activeRefreshPromise = null;
      }
    });

    return refreshPromise;
  }

  return {
    handleUnauthorized(context: RetryContext) {
      if (!shouldHandleUnauthorized(context)) {
        return;
      }

      latestRefreshPromise = ensureSessionRefreshed();
    },
    async shouldRetry(context: RetryContext) {
      if (!shouldHandleUnauthorized(context)) {
        return false;
      }

      const refreshPromise = latestRefreshPromise ?? ensureSessionRefreshed();
      return refreshPromise;
    },
  };
}
