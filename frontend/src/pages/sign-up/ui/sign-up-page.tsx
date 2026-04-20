import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ButtonLink } from '@/shared/ui/button-link';
import { FormFeedback } from '@/shared/ui/form-feedback';
import { FormField } from '@/shared/ui/form-field';
import { FormSubmitButton } from '@/shared/ui/form-submit-button';
import { RoutePreviewPage } from '@/shared/ui/route-preview-page';
import { SurfaceCard } from '@/shared/ui/surface-card';

export function SignUpPage() {
  return (
    <div className="route-page-stack">
      <RoutePreviewPage
        actions={
          <>
            <ButtonLink to={ROUTE_PATHS.signIn}>Back to sign in</ButtonLink>
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
      <SurfaceCard
        eyebrow="Shared auth UI"
        title="Registration flow reuses the same field, submit and success primitives"
      >
        <form className="form-showcase">
          <div className="form-layout">
            <FormField
              autoComplete="username"
              label="Username"
              name="registration-username"
              placeholder="Choose a username"
              required
            />
            <FormField
              autoComplete="email"
              label="Email"
              name="registration-email"
              placeholder="name@example.com"
              required
              type="email"
            />
            <FormField
              autoComplete="new-password"
              label="Password"
              name="registration-password"
              placeholder="Create a password"
              required
              type="password"
            />
          </div>
          <div className="form-actions">
            <FormSubmitButton>Create account</FormSubmitButton>
          </div>
        </form>
        <FormFeedback
          description="The same shared success block can confirm account creation, profile save or password update."
          state="success"
          title="Success state"
        />
      </SurfaceCard>
    </div>
  );
}
