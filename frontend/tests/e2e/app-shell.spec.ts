import { expect, test, type Page } from '@playwright/test';

const CURRENT_PROFILE_RESPONSE = {
  userId: '3d76bc6b-7ceb-4a45-8ef4-b1ce75e6fd4d',
  username: 'anna',
  email: 'anna@example.com',
  about: 'Product-minded engineer',
  dateOfBirth: '1999-12-31',
  age: 26,
};

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
  await page.route('**/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });

  await page.goto('/sign-in');

  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  await expect(getSignInPane(page).getByText('Username *')).toBeVisible();

  await signIn(page);

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'Welcome back, anna' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
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
  await page.route('**/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });

  await page.goto('/sign-up');

  await expect(getSignUpPane(page).getByText('Email *')).toBeVisible();

  const signUpPane = getSignUpPane(page);
  await signUpPane.getByLabel('Username *').fill('new-user');
  await signUpPane.getByLabel('Email *').fill('new-user@example.com');
  await signUpPane.getByLabel('Password *').fill('strong-password');
  await signUpPane.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'Welcome back, anna' })).toBeVisible();
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

  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page).toHaveURL(/\/profile\/edit$/);
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(getSignInPane(page).getByText('Username *')).toBeVisible();
});

test('protected layout exposes home and settings navigation, and sign-out lives in settings on desktop and mobile', async ({ page }) => {
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
  await page.route('**/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CURRENT_PROFILE_RESPONSE),
    });
  });

  await page.goto('/sign-in');
  await signIn(page);

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page).toHaveURL(/\/profile\/edit$/);
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });

  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
});

test('profile route renders loading result and recoverable error state for current user fetch', async ({ page }) => {
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
  await page.route('**/v1/users/me', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Service unavailable',
      }),
    });
  });

  await page.goto('/sign-in');
  await signIn(page);

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText('Profile is unavailable')).toBeVisible();
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

  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await expect(page).toHaveURL(/\/profile\/edit$/);
  await page.getByLabel('User Name *').fill('anna-updated');
  await page.getByLabel('Email *').fill('anna-updated@example.com');
  await page.getByLabel('About').fill('Updated from the edit screen');
  await page.getByLabel('Date of Birth').fill('2000-01-02');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page).toHaveURL(/\/profile\/edit$/);
  await expect(page.getByText('Profile saved')).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'Welcome back, anna-updated' })).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'anna-updated@example.com' })).toBeVisible();
  await expect(page.getByText('Updated from the edit screen')).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: '2000-01-02' })).toBeVisible();
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

  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await expect(page).toHaveURL(/\/profile\/edit$/);
  await page.getByLabel('User Name *').fill('');
  await page.getByLabel('Email *').fill('not-an-email');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Username is required.')).toBeVisible();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();

  await page.getByLabel('User Name *').fill('anna');
  await page.getByLabel('Email *').fill('anna@example.com');
  await page.getByRole('button', { name: 'Save' }).click();

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

  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('link', { name: 'Security', exact: true }).click();

  await expect(page).toHaveURL(/\/profile\/password$/);
  await page.getByLabel('Current Password *').fill('strong-password');
  await page.getByLabel('New Password *').fill('stronger-password');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Password updated')).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await signIn(page);
  await expect(page.getByText('Sign-in failed')).toBeVisible();

  await signIn(page, 'stronger-password');
  await expect(page).toHaveURL(/\/profile\/password$/);
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

  await expect(page).toHaveURL(/\/profile$/);
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
