import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ButtonLink } from '@/shared/ui/button-link';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';

export function SignUpPage() {
  return (
    <RoutePreviewPage
      actions={
        <>
          <ButtonLink to={ROUTE_PATHS.signIn}>Back to sign in</ButtonLink>
          <ButtonLink
            to={ROUTE_PATHS.users}
            variant="secondary"
          >
            Preview users area
          </ButtonLink>
        </>
      }
      description="The registration route reuses the same public shell while staying free from future auth and API implementation details."
      eyebrow="Sign up"
      items={[
        {
          title: 'Registration framing',
          description: 'This surface will host the create-account flow, optional profile fields and conflict feedback.',
        },
        {
          title: 'Consistent public shell',
          description: 'Shared branding, copy and route tabs stay stable while only the route content changes.',
        },
        {
          title: 'Expandable layout',
          description: 'The panel is wide enough for helper copy, states and future success messaging.',
        },
      ]}
      nextSteps={[
        'Attach sign-up form behaviour in TASK-012.',
        'Reuse shared form primitives once TASK-011 is implemented.',
      ]}
      status="Public route"
      title="Sign-up route shares the public wrapper, not a separate one-off page shell."
    />
  );
}
