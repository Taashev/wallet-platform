import { expect, test } from '@playwright/test';

test('sign-in route renders the public app shell', async ({ page }) => {
  await page.goto('/sign-in');

  await expect(page.locator('.brand-mark__title')).toHaveText('Users Service Web');
  await expect(
    page.getByRole('heading', { name: 'Entry flows now live inside a dedicated shell.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Sign-in page sits in a dedicated public layout.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Sign in' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Persist preview session' }),
  ).toBeVisible();
});

test('unauthorized visitor is redirected from protected route to sign-in', async ({ page }) => {
  await page.goto('/profile');

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(
    page.getByRole('heading', { name: 'Sign-in page sits in a dedicated public layout.' }),
  ).toBeVisible();
});

test('persisted session survives reload and redirects away from public auth routes', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByRole('button', { name: 'Persist preview session' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole('heading', { name: 'Profile screen now lives inside the protected shell.' }),
  ).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole('heading', { name: 'Profile screen now lives inside the protected shell.' }),
  ).toBeVisible();
});
