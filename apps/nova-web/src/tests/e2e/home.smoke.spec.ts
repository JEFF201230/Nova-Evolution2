import { expect, test } from '@playwright/test';

test('NOVA Home opens in a real browser', async ({ page }) => {
  await page.goto('/home');

  await expect(page).toHaveURL(/\/home$/);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
});
