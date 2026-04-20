import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ButtonLink } from '@/shared/ui/button-link';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';

export function ProfilePasswordPage() {
  return (
    <RoutePreviewPage
      actions={
        <>
          <ButtonLink to={ROUTE_PATHS.profile}>Profile overview</ButtonLink>
          <ButtonLink
            to={ROUTE_PATHS.profileDelete}
            variant="secondary"
          >
            Delete account route
          </ButtonLink>
        </>
      }
      description="Password management is already isolated as a protected route so secure actions do not get mixed into profile reading and editing contexts."
      eyebrow="Change password"
      items={[
        {
          title: 'Sensitive action isolation',
          description: 'This route keeps password changes separated from general profile updates.',
        },
        {
          title: 'Feedback-friendly shell',
          description: 'The page has room for validation, success messages and password rules.',
        },
        {
          title: 'Stable protected navigation',
          description: 'Moving between profile routes no longer requires page-specific navigation duplication.',
        },
      ]}
      nextSteps={[
        'Attach old/new password form in the feature task.',
        'Use centralized error and session flows in later integration tasks.',
      ]}
      status="Protected route"
      title="Password changes are routed through their own protected layout branch."
    />
  );
}
