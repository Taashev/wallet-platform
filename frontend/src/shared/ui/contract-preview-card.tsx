import { SurfaceCard } from '@/shared/ui/surface-card';

type ContractPreviewCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  rawPayload: unknown;
  normalizedPayload: unknown;
};

function formatPayload(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function ContractPreviewCard({
  eyebrow,
  title,
  description,
  rawPayload,
  normalizedPayload,
}: ContractPreviewCardProps) {
  return (
    <SurfaceCard
      eyebrow={eyebrow}
      title={title}
    >
      <div className="contract-preview">
        <p>{description}</p>

        <div className="contract-preview__grid">
          <div className="contract-preview__panel">
            <strong>Raw DTO</strong>
            <pre>{formatPayload(rawPayload)}</pre>
          </div>

          <div className="contract-preview__panel">
            <strong>Normalized model</strong>
            <pre>{formatPayload(normalizedPayload)}</pre>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
