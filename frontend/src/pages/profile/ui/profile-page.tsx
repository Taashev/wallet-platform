import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ProtectedSessionProbeCard } from '@/features/auth/ui/protected-session-probe-card';
import {
  normalizeCurrentUserDto,
  type CurrentUserResponseDto,
} from '@/shared/api/contracts/users-service-contract';
import { ButtonLink } from '@/shared/ui/button-link';
import { ContractPreviewCard } from '@/shared/ui/contract-preview-card';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';

const PROFILE_DTO_EXAMPLE: CurrentUserResponseDto = {
  userId: '3d76bc6b-7ceb-4a45-8ef4-b1ce75e6fd4d',
  username: 'anna',
  email: 'anna@example.com',
  about: '   ',
  dateOfBirth: 'not-a-date',
  age: '26',
};

export function ProfilePage() {
  const normalizedProfile = normalizeCurrentUserDto(PROFILE_DTO_EXAMPLE);

  return (
    <div className="route-page-stack">
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
      <ContractPreviewCard
        description="Current-user payload keeps private fields like `email`, while the frontend still normalizes ambiguous `about`, `dateOfBirth` and `age` values defensively before rendering."
        eyebrow="Profile contract"
        normalizedPayload={normalizedProfile}
        rawPayload={PROFILE_DTO_EXAMPLE}
        title="Current user payload is normalized into a safe profile model"
      />
      <ProtectedSessionProbeCard />
    </div>
  );
}
