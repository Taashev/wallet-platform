import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ButtonLink } from '@/shared/ui/button-link';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';

export function ProfileDeletePage() {
  return (
    <RoutePreviewPage
      actions={
        <>
          <ButtonLink to={ROUTE_PATHS.profile}>Return to profile</ButtonLink>
          <ButtonLink
            to={ROUTE_PATHS.signIn}
            variant="secondary"
          >
            Public shell
          </ButtonLink>
        </>
      }
      description="Account deletion gets a dedicated protected route so destructive behaviour is not squeezed into unrelated profile screens."
      eyebrow="Delete account"
      items={[
        {
          title: 'Separate confirmation context',
          description: 'The route can later host warning copy, confirmation controls and irreversible action messaging.',
        },
        {
          title: 'Protected shell continuity',
          description: 'Users keep the same navigation framework while entering a more sensitive flow.',
        },
        {
          title: 'Task isolation',
          description: 'Deletion handling can be implemented later without restructuring the routing model.',
        },
      ]}
      nextSteps={[
        'Add destructive confirmation UX when the feature task starts.',
        'Connect sign-out and session cleanup once auth flows are available.',
      ]}
      status="Protected route"
      title="Delete-account flow is already separated from the rest of the profile area."
    />
  );
}
