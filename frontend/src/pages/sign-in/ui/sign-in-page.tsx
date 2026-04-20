import { AuthSessionPreviewCard } from '@/entities/auth/ui/auth-session-preview-card';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { AuthApiPreviewCard } from '@/features/auth/ui/auth-api-preview-card';
import {
  normalizeAuthTokensDto,
  type AuthTokensDto,
} from '@/shared/api/contracts/users-service-contract';
import { ButtonLink } from '@/shared/ui/button-link';
import { ContractPreviewCard } from '@/shared/ui/contract-preview-card';
import { FormFeedback } from '@/shared/ui/form-feedback';
import { FormField } from '@/shared/ui/form-field';
import { FormSubmitButton } from '@/shared/ui/form-submit-button';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';
import { SurfaceCard } from '@/shared/ui/surface-card';
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
            description: 'Public layout now respects bootstrap state and redirects authorized users away from auth routes.',
          },
        ]}
        nextSteps={[
          'Attach sign-in form behaviour in TASK-012.',
          'Reuse shared form primitives once TASK-011 is implemented.',
        ]}
        status="Public route"
        title="Sign-in page sits in a dedicated public layout."
      />
      <SurfaceCard
        eyebrow="Form primitives"
        title="Sign-in form can now be composed from shared fields and feedback blocks"
      >
        <form className="form-showcase">
          <div className="form-layout">
            <FormField
              autoComplete="username"
              defaultValue="anna"
              hint="Use the same primitive for auth, profile and search inputs."
              label="Username"
              name="username"
              placeholder="Enter your username"
              required
            />
            <FormField
              autoComplete="current-password"
              label="Password"
              name="password"
              placeholder="Enter your password"
              required
              type="password"
            />
          </div>

          <div className="form-actions">
            <FormSubmitButton>Sign in</FormSubmitButton>
            <FormSubmitButton busy>Signing in</FormSubmitButton>
          </div>
        </form>

        <div className="feedback-grid">
          <FormFeedback
            description="The submit button is disabled and the form keeps layout stability while auth is in flight."
            state="loading"
            title="Loading state"
          />
          <FormFeedback
            description="Normalized backend or network errors can be shown in one shared visual treatment."
            state="error"
            title="Error state"
          />
        </div>
      </SurfaceCard>
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
