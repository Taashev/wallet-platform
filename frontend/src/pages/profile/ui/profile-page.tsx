import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ButtonLink } from '@/shared/ui/button-link';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';

export function ProfilePage() {
  return (
    <RoutePreviewPage
      actions={
        <>
          <ButtonLink to={ROUTE_PATHS.profileEdit}>Edit profile route</ButtonLink>
          <ButtonLink
            to={ROUTE_PATHS.users}
            variant="secondary"
          >
            Open users route
          </ButtonLink>
        </>
      }
      description="This protected route is already separated from public auth screens and will later host the current-user profile surface."
      eyebrow="Profile"
      items={[
        {
          title: 'Profile summary slot',
          description: 'Ready for the current user card, metadata blocks and account actions.',
        },
        {
          title: 'Shared protected framing',
          description: 'Sidebar navigation and topbar stay outside the page so feature modules stay focused.',
        },
        {
          title: 'Route-level scalability',
          description: 'Future profile screens can stay inside the protected shell without duplicating navigation.',
        },
      ]}
      nextSteps={[
        'Attach profile data loading after integration tasks are complete.',
        'Enable actual route guard in TASK-010.',
      ]}
      status="Protected route"
      title="Profile screen now lives inside the protected shell."
    />
  );
}
