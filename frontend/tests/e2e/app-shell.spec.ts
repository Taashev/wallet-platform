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

  await expect(page.locator('.brand-mark__title')).toHaveText('Users Service Web');
  await expect(
    page.getByRole('heading', { name: 'Enter the protected workspace with your existing account' }),
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
    page.getByRole('heading', { name: 'Create a new account and enter the protected workspace' }),
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
    page.getByRole('heading', { name: 'Enter the protected workspace with your existing account' }),
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
    page.getByRole('heading', { name: 'Enter the protected workspace with your existing account' }),
  ).toBeVisible();
});
