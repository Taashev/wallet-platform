import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { FormFeedback } from '@/shared/ui/form-feedback';
import { FormField } from '@/shared/ui/form-field';
import { FormSubmitButton } from '@/shared/ui/form-submit-button';
import { SurfaceCard } from '@/shared/ui/surface-card';

export function SignUpPage() {
  const authApi = useAuthApi();
  const authSession = useAuthSession();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{
    kind: 'idle' | 'submitting' | 'error';
    title?: string;
    description?: string;
  }>({ kind: 'idle' });
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();
    const nextFieldErrors = {
      username: normalizedUsername ? undefined : 'Username is required.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ? undefined
        : 'Enter a valid email address.',
      password: password.length >= 8
        ? undefined
        : 'Password must be at least 8 characters long.',
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.username || nextFieldErrors.email || nextFieldErrors.password) {
      setStatus({
        kind: 'error',
        title: 'Registration data is incomplete',
        description: 'Fill in username, valid email and password before creating an account.',
      });
      return;
    }

    setStatus({
      kind: 'submitting',
      title: 'Creating account',
      description: 'Submitting registration data and opening the protected area.',
    });

    try {
      const session = await authApi.signup({
        username: normalizedUsername,
        email: normalizedEmail,
        password,
      });

      authSession.saveSession(session);
      void navigate(ROUTE_PATHS.profile, { replace: true });
    } catch (error) {
      const usersServiceError = normalizeUsersServiceError(error);
      setStatus({
        kind: 'error',
        title: 'Sign-up failed',
        description: usersServiceError.message,
      });
    }
  }

  return (
    <section className="auth-screen">
      <SurfaceCard eyebrow="Sign up">
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
              name="registration-username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Choose a username"
              required
              value={username}
            />
            <FormField
              autoComplete="email"
              disabled={status.kind === 'submitting'}
              error={fieldErrors.email}
              label="Email"
              name="registration-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              type="email"
              value={email}
            />
            <FormField
              autoComplete="new-password"
              disabled={status.kind === 'submitting'}
              error={fieldErrors.password}
              hint="Use at least 8 characters for the MVP password flow."
              label="Password"
              name="registration-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              required
              type="password"
              value={password}
            />
          </div>
          <div className="form-actions">
            <FormSubmitButton
              busy={status.kind === 'submitting'}
              busyLabel="Creating account…"
            >
              Create account
            </FormSubmitButton>
          </div>
        </form>
        {status.kind !== 'idle' ? (
          <FormFeedback
            description={status.description!}
            state={status.kind === 'submitting' ? 'loading' : 'error'}
            title={status.title!}
          />
        ) : null}
      </SurfaceCard>
    </section>
  );
}
