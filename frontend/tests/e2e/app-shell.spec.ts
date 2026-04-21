import { expect, test } from '@playwright/test';

const CURRENT_PROFILE_RESPONSE = {
  userId: '3d76bc6b-7ceb-4a45-8ef4-b1ce75e6fd4d',
  username: 'anna',
  email: 'anna@example.com',
  about: 'Product-minded engineer',
  dateOfBirth: '1999-12-31',
  age: 26,
};

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
  await expect(
    page.getByText('Username *'),
  ).toBeVisible();

  await page.getByLabel('Username *').fill('existing-user');
  await page.getByLabel('Password *').fill('strong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole('heading', { name: '@anna' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Sign out' }),
  ).toBeVisible();
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

  await expect(
    page.getByText('Email *'),
  ).toBeVisible();

  await page.getByLabel('Username *').fill('new-user');
  await page.getByLabel('Email *').fill('new-user@example.com');
  await page.getByLabel('Password *').fill('strong-password');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole('heading', { name: '@anna' }),
  ).toBeVisible();
});

test('unauthorized visitor is redirected from protected route to sign-in', async ({ page }) => {
  await page.goto('/profile');

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(
    page.getByText('Username *'),
  ).toBeVisible();
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
  await page.getByLabel('Username *').fill('existing-user');
  await page.getByLabel('Password *').fill('strong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(
    page.getByText('Username *'),
  ).toBeVisible();
});

test('protected layout exposes profile, users and sign-out navigation on desktop and mobile', async ({ page }) => {
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
  await page.getByLabel('Username *').fill('existing-user');
  await page.getByLabel('Password *').fill('strong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('link', { name: 'Profile', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Users', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();

  await page.getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page).toHaveURL(/\/users$/);

  await page.setViewportSize({ width: 390, height: 844 });

  await expect(page.getByRole('link', { name: 'Profile', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Users', exact: true })).toBeVisible();
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
  await page.getByLabel('Username *').fill('existing-user');
  await page.getByLabel('Password *').fill('strong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByText('Profile is unavailable'),
  ).toBeVisible();
});

test('profile edit saves changes and updates profile screen without a manual reload', async ({ page }) => {
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
  await page.getByLabel('Username *').fill('existing-user');
  await page.getByLabel('Password *').fill('strong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('link', { name: 'Edit profile' }).click();

  await expect(page).toHaveURL(/\/profile\/edit$/);
  await page.getByLabel('Username *').fill('anna-updated');
  await page.getByLabel('Email *').fill('anna-updated@example.com');
  await page.getByLabel('About').fill('Updated from the edit screen');
  await page.getByLabel('Date of birth').fill('2000-01-02');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText('Profile updated')).toBeVisible();
  await expect(page.getByRole('heading', { name: '@anna-updated' })).toBeVisible();
  await expect(page.getByText('anna-updated@example.com')).toBeVisible();
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
  await page.getByLabel('Username *').fill('existing-user');
  await page.getByLabel('Password *').fill('strong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole('link', { name: 'Edit profile' }).click();

  await expect(page).toHaveURL(/\/profile\/edit$/);
  await page.getByLabel('Username *').fill('');
  await page.getByLabel('Email *').fill('not-an-email');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText('Username is required.')).toBeVisible();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();

  await page.getByLabel('Username *').fill('anna');
  await page.getByLabel('Email *').fill('anna@example.com');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText('Profile was not saved')).toBeVisible();
  await expect(page.getByText('Request conflicts with existing users-service data.')).toBeVisible();
});
