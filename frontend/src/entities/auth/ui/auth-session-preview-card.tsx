import { useAuthSession } from '@/app/providers/use-auth-session';
import type { AuthSession } from '@/entities/auth/model/auth-session';
import { SurfaceCard } from '@/shared/ui/surface-card';

type AuthSessionPreviewCardProps = {
  previewSession: AuthSession;
};

function formatPayload(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function AuthSessionPreviewCard({
  previewSession,
}: AuthSessionPreviewCardProps) {
  const authSession = useAuthSession();

  return (
    <SurfaceCard
      eyebrow="Session strategy"
      title="Auth tokens are isolated in one session module"
    >
      <div className="session-preview-card">
        <p>
          Current web MVP keeps both tokens in browser <code>sessionStorage</code>,
          so they survive page reloads in the active tab without leaking storage details
          into pages or forms.
        </p>

        <div className="session-preview-card__grid">
          <div className="session-preview-card__panel">
            <strong>Bootstrap snapshot</strong>
            <pre>
              {formatPayload({
                isAuthenticated: authSession.isAuthenticated,
                storageKind: authSession.storageKind,
                session: authSession.session,
              })}
            </pre>
          </div>

          <div className="session-preview-card__panel">
            <strong>Preview session</strong>
            <pre>{formatPayload(previewSession)}</pre>
          </div>
        </div>

        <div className="session-preview-card__actions">
          <button
            className="connection-card__action"
            onClick={() => authSession.saveSession(previewSession)}
            type="button"
          >
            Persist preview session
          </button>
          <button
            className="connection-card__action connection-card__action--secondary"
            onClick={() => authSession.clearSession()}
            type="button"
          >
            Clear session
          </button>
        </div>
      </div>
    </SurfaceCard>
  );
}
