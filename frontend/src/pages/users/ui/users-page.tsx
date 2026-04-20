import { ROUTE_PATHS } from '@/app/router/route-paths';
import {
  normalizeUsersListResponseDto,
  type UsersListResponseDto,
} from '@/shared/api/contracts/users-service-contract';
import { ButtonLink } from '@/shared/ui/button-link';
import { ContractPreviewCard } from '@/shared/ui/contract-preview-card';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';

const USERS_LIST_DTO_EXAMPLE: UsersListResponseDto = {
  users: [
    {
      userId: '8e27fcf1-7dfb-4ea5-a4f8-3db0884fa9d6',
      username: 'user-one',
      about: 'Backend engineer',
      dateOfBirth: '1999-12-31',
      age: 26,
    },
    {
      userId: 'cc5a9302-cd78-4b64-851e-31c50afecab1',
      username: 'user-two',
      about: null,
      dateOfBirth: '',
      age: null,
    },
  ],
  total: 2,
};

export function UsersPage() {
  const normalizedUsersList = normalizeUsersListResponseDto(
    USERS_LIST_DTO_EXAMPLE,
  );

  return (
    <div className="route-page-stack">
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
      <ContractPreviewCard
        description="Public users data is normalized separately from `users/me`, so private fields like `email` do not leak into the directory model."
        eyebrow="Users contract"
        normalizedPayload={normalizedUsersList}
        rawPayload={USERS_LIST_DTO_EXAMPLE}
        title="Users list response is normalized into a public user model"
      />
    </div>
  );
}
