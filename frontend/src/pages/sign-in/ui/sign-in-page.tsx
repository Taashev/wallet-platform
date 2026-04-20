import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';
import {
  createErrorAuthFormStatus,
  createIdleAuthFormStatus,
  createSubmittingAuthFormStatus,
  type AuthFormStatus,
} from '@/features/auth/model/auth-form-state';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { ButtonLink } from '@/shared/ui/button-link';
import { FormFeedback } from '@/shared/ui/form-feedback';
import { FormField } from '@/shared/ui/form-field';
import { FormSubmitButton } from '@/shared/ui/form-submit-button';
import { SurfaceCard } from '@/shared/ui/surface-card';

export function SignInPage() {
  const authApi = useAuthApi();
  const authSession = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<AuthFormStatus>(createIdleAuthFormStatus());
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const redirectTarget = useMemo(
    () =>
      typeof location.state?.from === 'string'
        ? location.state.from
        : ROUTE_PATHS.profile,
    [location.state],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUsername = username.trim();
    const nextFieldErrors = {
      username: normalizedUsername ? undefined : 'Username is required.',
      password: password ? undefined : 'Password is required.',
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.username || nextFieldErrors.password) {
      setStatus(
        createErrorAuthFormStatus(
          'Form is incomplete',
          'Enter both username and password before continuing.',
        ),
      );
      return;
    }

    setStatus(
      createSubmittingAuthFormStatus(
        'Signing in',
        'Checking credentials and restoring the protected session.',
      ),
    );

    try {
      const session = await authApi.signin({
        username: normalizedUsername,
        password,
      });

      authSession.saveSession(session);
      setStatus(createIdleAuthFormStatus());
      void navigate(redirectTarget, { replace: true });
    } catch (error) {
      const usersServiceError = normalizeUsersServiceError(error);
      setStatus({
        kind: 'error',
        title: 'Sign-in failed',
        description: usersServiceError.message,
      });
    }
  }

  return (
    <section className="auth-screen">
      <SurfaceCard
        eyebrow="Sign in"
        title="Enter the protected workspace with your existing account"
      >
        <div className="auth-screen__intro">
          <p>
            Use your existing `username` and `password`. After a successful sign-in,
            the session is stored in the shared auth module and protected routes open immediately.
          </p>
        </div>

        <form
          className="form-showcase"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="form-layout">
            <FormField
              autoComplete="username"
              disabled={status.kind === 'submitting'}
              error={fieldErrors.username}
              label="Username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              required
              value={username}
            />
            <FormField
              autoComplete="current-password"
              disabled={status.kind === 'submitting'}
              error={fieldErrors.password}
              label="Password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </div>

          <div className="form-actions">
            <FormSubmitButton
              busy={status.kind === 'submitting'}
              busyLabel="Signing in…"
            >
              Sign in
            </FormSubmitButton>
            <ButtonLink
              to={ROUTE_PATHS.signUp}
              variant="secondary"
            >
              Create account
            </ButtonLink>
          </div>
        </form>

        {status.kind !== 'idle' ? (
          <FormFeedback
            description={status.description}
            state={status.kind === 'submitting' ? 'loading' : 'error'}
            title={status.title}
          />
        ) : null}
      </SurfaceCard>
    </section>
  );
}
