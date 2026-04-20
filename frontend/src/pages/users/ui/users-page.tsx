import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ButtonLink } from '@/shared/ui/button-link';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';

export function UsersPage() {
  return (
    <RoutePreviewPage
      actions={
        <>
          <ButtonLink to={ROUTE_PATHS.profile}>Profile route</ButtonLink>
          <ButtonLink
            to={ROUTE_PATHS.signIn}
            variant="secondary"
          >
            Public shell
          </ButtonLink>
        </>
      }
      description="Users listing is already grouped into the protected application area, ready for directory data, filters and pagination without leaking those concerns into public routes."
      eyebrow="Users list"
      items={[
        {
          title: 'Directory-ready route',
          description: 'A dedicated protected route is reserved for list, filter and pagination controls.',
        },
        {
          title: 'Navigation consistency',
          description: 'Users can move between account routes and directory routes inside one protected shell.',
        },
        {
          title: 'Future feature room',
          description: 'The route is wide enough for server-state panels, empty states and error messaging later on.',
        },
      ]}
      nextSteps={[
        'Connect users API integration after TASK-004 to TASK-006.',
        'Attach search and pagination behaviour in the users feature task.',
      ]}
      status="Protected route"
      title="Users directory belongs to the protected application shell from day one."
    />
  );
}
