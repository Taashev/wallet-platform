import { expect, test } from '@playwright/test';

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
    page.getByRole('heading', { name: 'Profile screen now lives inside the protected shell.' }),
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
    page.getByRole('heading', { name: 'Profile screen now lives inside the protected shell.' }),
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
