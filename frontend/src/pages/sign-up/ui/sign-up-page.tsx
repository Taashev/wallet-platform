import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';
import { clearCurrentProfile } from '@/features/profile/model/current-profile-store';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { DashboardField } from '@/shared/ui/dashboard-field';
import { DashboardNotice } from '@/shared/ui/dashboard-notice';
import { DashboardPanel } from '@/shared/ui/dashboard-panel';

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
			email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ? undefined : 'Enter a valid email address.',
			password: password.length >= 8 ? undefined : 'Password must be at least 8 characters long.',
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

			clearCurrentProfile();
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
		<section className='auth-page'>
			<DashboardPanel className='auth-form-panel' title='Sign up'>
				<form className='dashboard-form' noValidate onSubmit={(event) => void handleSubmit(event)}>
					{status.kind !== 'idle' ? (
						<DashboardNotice
							description={status.description!}
							title={status.title!}
							tone={status.kind === 'submitting' ? 'info' : 'error'}
						/>
					) : null}

					<div className='dashboard-form__grid'>
						<DashboardField
							disabled={status.kind === 'submitting'}
							error={fieldErrors.username}
							inputProps={{
								autoComplete: 'username',
								placeholder: 'Choose a username',
								type: 'text',
							}}
							label='Username'
							name='registration-username'
							onChange={(event) => setUsername(event.target.value)}
							required
							value={username}
						/>
						<DashboardField
							disabled={status.kind === 'submitting'}
							error={fieldErrors.email}
							inputProps={{
								autoComplete: 'email',
								placeholder: 'name@example.com',
								type: 'email',
							}}
							label='Email'
							name='registration-email'
							onChange={(event) => setEmail(event.target.value)}
							required
							value={email}
						/>
						<DashboardField
							disabled={status.kind === 'submitting'}
							error={fieldErrors.password}
							inputProps={{
								autoComplete: 'new-password',
								placeholder: 'Create a password',
								type: 'password',
							}}
							label='Password'
							name='registration-password'
							onChange={(event) => setPassword(event.target.value)}
							required
							value={password}
						/>
					</div>

					<div className='dashboard-form__actions'>
						<button
							className='dashboard-primary-button'
							disabled={status.kind === 'submitting'}
							type='submit'
						>
							{status.kind === 'submitting' ? 'Creating account…' : 'Create account'}
						</button>
					</div>
				</form>
			</DashboardPanel>
		</section>
	);
}
