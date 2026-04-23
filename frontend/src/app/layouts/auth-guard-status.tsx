import { SurfaceCard } from '@/shared/ui/surface-card';

type AuthGuardStatusProps = {
  title: string;
  description: string;
};

export function AuthGuardStatus({
  title,
  description,
}: AuthGuardStatusProps) {
  return (
    <main className="auth-guard-status">
      <SurfaceCard
        eyebrow="Session bootstrap"
        title={title}
        tone="accent"
      >
        <p>{description}</p>
      </SurfaceCard>
    </main>
  );
}
