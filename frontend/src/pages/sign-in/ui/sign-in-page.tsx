import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useAuthSession } from '@/app/providers/use-auth-session';
import { useAuthApi } from '@/features/auth/api/use-auth-api';
import {
	shouldRedirectToHomeAfterLogout,
} from '@/features/auth/model/post-logout-redirect';
import {
	createErrorAuthFormStatus,
	createIdleAuthFormStatus,
	createSubmittingAuthFormStatus,
	type AuthFormStatus,
} from '@/features/auth/model/auth-form-state';
import { clearCurrentProfile } from '@/features/profile/model/current-profile-store';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { DashboardField } from '@/shared/ui/dashboard-field';
import { DashboardNotice } from '@/shared/ui/dashboard-notice';
import { DashboardPanel } from '@/shared/ui/dashboard-panel';

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
	const isPostLogoutRedirect = shouldRedirectToHomeAfterLogout();
	const redirectTarget = useMemo(
		() =>
			!isPostLogoutRedirect &&
			location.state?.source === 'auth-guard' &&
			typeof location.state?.from === 'string'
				? location.state.from
				: ROUTE_PATHS.root,
		[isPostLogoutRedirect, location.state],
	);

	useEffect(() => {
		if (!isPostLogoutRedirect || location.state == null) {
			return;
		}

		void navigate(ROUTE_PATHS.signIn, { replace: true, state: null });
	}, [isPostLogoutRedirect, location.state, navigate]);

	function handleUsernameChange(nextValue: string) {
		setUsername(nextValue);

		if (fieldErrors.username) {
			setFieldErrors((current) => ({ ...current, username: undefined }));
		}

		if (status.kind === 'error') {
			setStatus(createIdleAuthFormStatus());
		}
	}

	function handlePasswordChange(nextValue: string) {
		setPassword(nextValue);

		if (fieldErrors.password) {
			setFieldErrors((current) => ({ ...current, password: undefined }));
		}

		if (status.kind === 'error') {
			setStatus(createIdleAuthFormStatus());
		}
	}

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

			clearCurrentProfile();
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
		<section className='auth-page'>
			<DashboardPanel className='auth-form-panel' title='Sign in'>
				<form
					aria-busy={status.kind === 'submitting'}
					className='dashboard-form'
					noValidate
					onSubmit={(event) => void handleSubmit(event)}
				>
					{status.kind !== 'idle' ? (
						<DashboardNotice
							description={status.description}
							title={status.title}
							tone={status.kind === 'submitting' ? 'info' : 'error'}
						/>
					) : null}

					<div className='dashboard-form__grid'>
						<DashboardField
							disabled={status.kind === 'submitting'}
							error={fieldErrors.username}
							hint='Use the username attached to your wallet profile.'
							inputProps={{
								autoComplete: 'username',
								autoFocus: true,
								placeholder: 'Enter your username',
								type: 'text',
							}}
							label='Username'
							name='username'
							onChange={(event) => handleUsernameChange(event.target.value)}
							required
							value={username}
						/>
						<DashboardField
							disabled={status.kind === 'submitting'}
							error={fieldErrors.password}
							hint='Password is case-sensitive.'
							inputProps={{
								autoComplete: 'current-password',
								placeholder: 'Enter your password',
								type: 'password',
							}}
							label='Password'
							name='password'
							onChange={(event) => handlePasswordChange(event.target.value)}
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
							{status.kind === 'submitting' ? 'Signing in…' : 'Sign in'}
						</button>
					</div>
				</form>
			</DashboardPanel>
		</section>
	);
}
