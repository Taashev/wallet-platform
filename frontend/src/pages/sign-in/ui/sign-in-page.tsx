import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ButtonLink } from '@/shared/ui/button-link';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';

export function SignInPage() {
  return (
    <RoutePreviewPage
      actions={
        <>
          <ButtonLink to={ROUTE_PATHS.signUp}>Create account</ButtonLink>
          <ButtonLink
            to={ROUTE_PATHS.profile}
            variant="secondary"
          >
            Open protected preview
          </ButtonLink>
        </>
      }
      description="This route is now isolated inside the public shell and ready to receive the username/password form without dragging router or layout concerns into the feature module."
      eyebrow="Sign in"
      items={[
        {
          title: 'Form slot',
          description: 'Primary auth surface is reserved for credentials, validation feedback and submit states.',
        },
        {
          title: 'Public navigation',
          description: 'Switching to sign up is already handled by the client router with no hard refresh.',
        },
        {
          title: 'Scoped responsibility',
          description: 'Session bootstrap and actual auth guard remain outside this task on purpose.',
        },
      ]}
      nextSteps={[
        'Attach sign-in form behaviour in TASK-012.',
        'Connect auth bootstrap and route protection in TASK-010.',
      ]}
      status="Public route"
      title="Sign-in page sits in a dedicated public layout."
    />
  );
}
