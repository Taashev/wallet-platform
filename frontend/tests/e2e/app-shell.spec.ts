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
