import { expect, test, type Page } from '@playwright/test';

const CURRENT_PROFILE_RESPONSE = {
  userId: '3d76bc6b-7ceb-4a45-8ef4-b1ce75e6fd4d',
  username: 'anna',
  email: 'anna@example.com',
  about: 'Product-minded engineer',
  dateOfBirth: '1999-12-31',
  age: 26,
};

const DIRECTORY_USERS = Array.from({ length: 18 }, (_, index) => ({
  userId: `public-user-${index + 1}`,
  username: index === 0 ? 'anna' : `user-${index + 1}`,
  about: null,
  dateOfBirth: null,
  age: null,
}));

async function mockUsersDirectory(page: Page) {
  await page.route(/\/v1\/users(\?.*)?$/, async (route, request) => {
    const requestUrl = new URL(request.url());
    const offset = Number(requestUrl.searchParams.get('offset') ?? '0');
    const limit = Number(requestUrl.searchParams.get('limit') ?? '12');
    const usernameFilter = requestUrl.searchParams
      .get('username')
      ?.trim()
      .toLowerCase();
    const filteredUsers = usernameFilter
      ? DIRECTORY_USERS.filter((user) =>
          user.username.toLowerCase().includes(usernameFilter),
        )
      : DIRECTORY_USERS;
    const users = filteredUsers.slice(offset, offset + limit);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        users,
        total: filteredUsers.length,
      }),
    });
  });
}

function getSignInPane(page: Page) {
  return page.getByTestId('auth-pane-sign-in');
}

function getSignUpPane(page: Page) {
  return page.getByTestId('auth-pane-sign-up');
}

async function signIn(page: Page, password = 'strong-password') {
  const pane = getSignInPane(page);

  await pane.getByLabel('Username *').fill('existing-user');
  await pane.getByLabel('Password *').fill(password);
  await pane.getByRole('button', { name: 'Sign in' }).click();
}

test('sign-in route submits credentials and opens protected area', async ({ page }) => {
  await page.route('**/v1/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);

  await page.goto('/sign-in');

  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  await expect(getSignInPane(page).getByText('Username *')).toBeVisible();

  await signIn(page);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('anna')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
});

test('sign-up route creates account and authenticates the new user', async ({ page }) => {
  await page.route('**/v1/auth/signup', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signup-access-token',
        refreshToken: 'signup-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);

  await page.goto('/sign-up');

  await expect(getSignUpPane(page).getByText('Email *')).toBeVisible();

  const signUpPane = getSignUpPane(page);
  await signUpPane.getByLabel('Username *').fill('new-user');
  await signUpPane.getByLabel('Email *').fill('new-user@example.com');
  await signUpPane.getByLabel('Password *').fill('strong-password');
  await signUpPane.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('anna')).toBeVisible();
});

test('auth form supports keyboard-only submit and disables controls while sign-in is pending', async ({ page }) => {
  let releaseSignInRequest: (() => void) | null = null;
  const signInRequestGate = new Promise<void>((resolve) => {
    releaseSignInRequest = resolve;
  });

  await page.route('**/v1/auth/signin', async (route) => {
    await signInRequestGate;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);
  await page.route('**/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });

  await page.goto('/sign-in');

  const signInPane = getSignInPane(page);
  const usernameField = signInPane.getByLabel('Username *');
  const passwordField = signInPane.getByLabel('Password *');

  await expect(usernameField).toBeFocused();
  await page.keyboard.type('existing-user');
  await page.keyboard.press('Tab');
  await expect(passwordField).toBeFocused();
  await page.keyboard.type('strong-password');
  await page.keyboard.press('Tab');
  await expect(signInPane.getByRole('button', { name: 'Show password' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(signInPane.getByRole('button', { name: 'Sign in' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(usernameField).toBeDisabled();
  await expect(passwordField).toBeDisabled();
  await expect(signInPane.getByRole('button', { name: 'Signing in…' })).toBeDisabled();

  releaseSignInRequest?.();

  await expect(page).toHaveURL(/\/$/);
});

test('home route shows paginated user cards and search narrows the protected list', async ({
  page,
}) => {
  await page.route('**/v1/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);

  await page.goto('/sign-in');
  await signIn(page);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('user-12')).toBeVisible();
  await expect(page.getByText('user-13')).toHaveCount(0);

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('user-13')).toBeVisible();

  await page.getByPlaceholder('Search by username').fill('anna');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('anna')).toBeVisible();

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByText('user-12')).toBeVisible();
});

test('unauthorized visitor is redirected from protected route to sign-in', async ({ page }) => {
  await page.goto('/profile');

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(getSignInPane(page).getByText('Username *')).toBeVisible();
});

test('sign-out clears the local session and redirects back to sign-in', async ({ page }) => {
  await page.route('**/v1/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);
  await page.route('**/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });
  await page.route('**/v1/auth/signout', async (route) => {
    await route.fulfill({
      status: 204,
      body: '',
    });
  });

  await page.goto('/sign-in');
  await signIn(page);

  await expect(page).toHaveURL(/\/$/);
  await Promise.all([
    page.waitForURL(/\/sign-in$/),
    page.getByRole('button', { name: 'Sign out' }).click(),
  ]);

  await expect(getSignInPane(page).getByText('Username *')).toBeVisible();
  await signIn(page);
  await expect(page).toHaveURL(/\/$/);
});

test('protected layout exposes home and settings navigation, and sign-out lives in topbar on desktop and mobile', async ({ page }) => {
  await page.route('**/v1/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);
  await page.route('**/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });

  await page.goto('/sign-in');
  await signIn(page);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();

  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page).toHaveURL(/\/profile\/edit$/);
  await expect(page.getByLabel('User Name *')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });

  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit profile', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Security', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Delete account', exact: true })).toBeVisible();
});

test('profile route retries after a recoverable current-user error without reloading the app', async ({ page }) => {
  let allowProfileSuccess = false;

  await page.route('**/v1/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);
  await page.route('**/v1/users/me', async (route) => {
    if (!allowProfileSuccess) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Service unavailable',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/sign-in$/);
  await signIn(page);

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText('Profile is unavailable')).toBeVisible();
  allowProfileSuccess = true;
  await page.getByRole('button', { name: 'Retry request' }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back, anna' }),
  ).toBeVisible();
});

test('users route retries after a recoverable directory error without reloading the app', async ({ page }) => {
  let allowUsersSuccess = false;

  await page.route('**/v1/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await page.route(/\/v1\/users(\?.*)?$/, async (route) => {
    if (!allowUsersSuccess) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Service unavailable',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        users: DIRECTORY_USERS.slice(0, 12),
        total: DIRECTORY_USERS.length,
      }),
    });
  });

  await page.goto('/users');
  await expect(page).toHaveURL(/\/sign-in$/);
  await signIn(page);

  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByText('Users list is unavailable')).toBeVisible();
  allowUsersSuccess = true;
  await page.getByRole('button', { name: 'Retry request' }).click();
  await expect(page.getByText('user-12')).toBeVisible();
});

test('profile edit saves changes and updates the home screen without a manual reload', async ({ page }) => {
  let currentProfileResponse = {
    ...CURRENT_PROFILE_RESPONSE,
  };

  await page.route('**/v1/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);
  await page.route('**/v1/users/me', async (route, request) => {
    if (request.method() === 'PATCH') {
      const payload = request.postDataJSON() as {
        username: string;
        email: string;
        about: string;
        dateOfBirth: string;
      };
      currentProfileResponse = {
        ...currentProfileResponse,
        username: payload.username,
        email: payload.email,
        about: payload.about || null,
        dateOfBirth: payload.dateOfBirth || null,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentProfileResponse),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentProfileResponse),
    });
  });

  await page.goto('/sign-in');
  await signIn(page);

  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await expect(page).toHaveURL(/\/profile\/edit$/);
  await page.getByLabel('User Name *').fill('anna-updated');
  await page.getByLabel('Email *').fill('anna-updated@example.com');
  await page.getByLabel('About').fill('Updated from the edit screen');
  await page.getByLabel('Date of Birth').fill('2000-01-02');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page).toHaveURL(/\/profile\/edit$/);
  await expect(page.getByText('Profile saved')).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('anna')).toBeVisible();
  await page.getByRole('link', { name: 'Profile details' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole('heading', { name: 'Welcome back, anna-updated' }),
  ).toBeVisible();
  await expect(
    page.getByRole('definition').filter({ hasText: 'anna-updated@example.com' }),
  ).toBeVisible();
  await expect(page.getByText('Updated from the edit screen')).toBeVisible();
  await expect(
    page.getByRole('definition').filter({ hasText: '2000-01-02' }),
  ).toBeVisible();
});

test('profile edit shows validation and save errors next to the form', async ({ page }) => {
  await page.route('**/v1/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);
  await page.route('**/v1/users/me', async (route, request) => {
    if (request.method() === 'PATCH') {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Conflict',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });

  await page.goto('/sign-in');
  await signIn(page);

  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await expect(page).toHaveURL(/\/profile\/edit$/);
  await page.getByLabel('User Name *').fill('');
  await page.getByLabel('Email *').fill('not-an-email');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText('Username is required.')).toBeVisible();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();

  await page.getByLabel('User Name *').fill('anna');
  await page.getByLabel('Email *').fill('anna@example.com');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText('Profile was not saved')).toBeVisible();
  await expect(page.getByText('Request conflicts with existing users-service data.')).toBeVisible();
});

test('security tab updates the password and the next sign-in only accepts the new password', async ({ page }) => {
  let activePassword = 'strong-password';

  await page.route('**/v1/auth/signin', async (route, request) => {
    const payload = request.postDataJSON() as {
      username: string;
      password: string;
    };

    if (payload.password !== activePassword) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Unauthorized',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);
  await page.route('**/v1/users/me/password', async (route, request) => {
    if (request.method() === 'PATCH') {
      const payload = request.postDataJSON() as {
        oldPassword: string;
        newPassword: string;
      };

      if (payload.oldPassword !== activePassword) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Unauthorized',
          }),
        });
        return;
      }

      activePassword = payload.newPassword;
      await route.fulfill({
        status: 204,
        body: '',
      });
    }
  });
  await page.route('**/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });
  await page.route('**/v1/auth/signout', async (route) => {
    await route.fulfill({
      status: 204,
      body: '',
    });
  });

  await page.goto('/sign-in');
  await signIn(page);

  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('link', { name: 'Security', exact: true }).click();

  await expect(page).toHaveURL(/\/profile\/password$/);
  await page.getByLabel('Current Password *').fill('strong-password');
  await page.getByLabel('New Password *').fill('stronger-password');
  await page.getByRole('button', { name: 'Save new password' }).click();

  await expect(page.getByText('Password updated')).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await signIn(page);
  await expect(page.getByText('Sign-in failed')).toBeVisible();

  await signIn(page, 'stronger-password');
  await expect(page).toHaveURL(/\/$/);
});

test('delete account requires explicit confirmation and clears the local session after success', async ({ page }) => {
  await page.route('**/v1/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'signin-access-token',
        refreshToken: 'signin-refresh-token',
      }),
    });
  });
  await mockUsersDirectory(page);
  await page.route('**/v1/users/me', async (route, request) => {
    if (request.method() === 'DELETE') {
      await route.fulfill({
        status: 204,
        body: '',
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });

  await page.goto('/sign-in');
  await signIn(page);

  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('link', { name: 'Delete account', exact: true }).click();

  await expect(page).toHaveURL(/\/profile\/delete$/);
  await page.getByRole('button', { name: 'Delete account' }).click();
  await expect(page.getByText('Type anna exactly to confirm account deletion.')).toBeVisible();

  await page.getByLabel('Confirm Username *').fill('anna');
  await page.getByRole('button', { name: 'Delete account' }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(getSignInPane(page).getByText('Username *')).toBeVisible();

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/sign-in$/);
});
