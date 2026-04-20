import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ButtonLink } from '@/shared/ui/button-link';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';

export function ProfileEditPage() {
  return (
    <RoutePreviewPage
      actions={
        <>
          <ButtonLink to={ROUTE_PATHS.profile}>Back to profile</ButtonLink>
          <ButtonLink
            to={ROUTE_PATHS.profilePassword}
            variant="secondary"
          >
            Password route
          </ButtonLink>
        </>
      }
      description="A separate route already exists for editing account details, so form behaviour can land later without redesigning the shell."
      eyebrow="Edit profile"
      items={[
        {
          title: 'Dedicated edit route',
          description: 'Changes to username, email, about and date of birth have their own route context.',
        },
        {
          title: 'Form-friendly container',
          description: 'The layout provides space for labels, helper text, error states and action bars.',
        },
        {
          title: 'No API coupling yet',
          description: 'The screen is structurally ready while waiting for contracts, HTTP client and mutation logic.',
        },
      ]}
      nextSteps={[
        'Attach form primitives from TASK-011.',
        'Connect current-user update flow after integration tasks are complete.',
      ]}
      status="Protected route"
      title="Profile editing gets its own route instead of overloading the summary screen."
    />
  );
}
