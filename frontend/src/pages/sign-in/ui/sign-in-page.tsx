import { AuthSessionPreviewCard } from '@/entities/auth/ui/auth-session-preview-card';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { AuthApiPreviewCard } from '@/features/auth/ui/auth-api-preview-card';
import {
  normalizeAuthTokensDto,
  type AuthTokensDto,
} from '@/shared/api/contracts/users-service-contract';
import { ButtonLink } from '@/shared/ui/button-link';
import { ContractPreviewCard } from '@/shared/ui/contract-preview-card';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';
import { UsersServiceConnectionCard } from '@/shared/ui/users-service-connection-card';

const AUTH_TOKENS_DTO_EXAMPLE: AuthTokensDto = {
  accessToken: ' access.jwt.token ',
  refreshToken: ' refresh.jwt.token ',
};

export function SignInPage() {
  const normalizedAuthTokens = normalizeAuthTokensDto(AUTH_TOKENS_DTO_EXAMPLE);

  return (
    <div className="route-page-stack">
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
      <ContractPreviewCard
        description="Auth screens can now work with normalized token payloads instead of consuming raw response bodies directly."
        eyebrow="Auth contract"
        normalizedPayload={normalizedAuthTokens}
        rawPayload={AUTH_TOKENS_DTO_EXAMPLE}
        title="Auth tokens DTO is normalized before feature usage"
      />
      <AuthSessionPreviewCard previewSession={normalizedAuthTokens} />
      <AuthApiPreviewCard />
      <UsersServiceConnectionCard />
    </div>
  );
}
