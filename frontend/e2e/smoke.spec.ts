import { test, expect } from '@playwright/test';

test.describe('System Smoke Test', () => {
  test('frontend loads and successfully connects to the backend status endpoint', async ({ page }) => {
    await page.goto('/');

    // Verify main header
    await expect(page.locator('h1')).toHaveText('Modern Project Base');

    // Wait for the backend response to populate "System Healthy"
    await expect(page.getByText('System Healthy')).toBeVisible({ timeout: 10000 });

    // Verify service version renders
    await expect(page.getByText('v0.1.0')).toBeVisible();
  });
});
