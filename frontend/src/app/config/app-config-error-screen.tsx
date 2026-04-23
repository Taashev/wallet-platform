import type { AppConfigIssue } from '@/shared/config/app-config';
import { SurfaceCard } from '@/shared/ui/surface-card';

type AppConfigErrorScreenProps = {
  issue: AppConfigIssue;
};

export function AppConfigErrorScreen({
  issue,
}: AppConfigErrorScreenProps) {
  return (
    <main className="config-screen">
      <section className="config-screen__hero">
        <span className="hero-eyebrow">Configuration error</span>
        <h1>Frontend environment is not ready for users-service connectivity.</h1>
        <p className="hero-description">
          App startup is intentionally stopped until the API base URL is configured correctly. This prevents hidden
          hardcoded endpoints and avoids routing the app into broken network state.
        </p>
      </section>

      <div className="config-screen__grid">
        <SurfaceCard
          eyebrow="Problem"
          title="Users service API base URL is invalid or missing"
          tone="accent"
        >
          <p>{issue.message}</p>
          {issue.receivedValue ? (
            <p className="config-screen__meta">
              Current value: <code>{issue.receivedValue}</code>
            </p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Expected env keys"
          title="Set one of these variables in frontend/.env"
        >
          <ul className="route-preview__list">
            {issue.envKeys.map((envKey) => (
              <li key={envKey}>
                <code>{envKey}</code>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>
    </main>
  );
}
