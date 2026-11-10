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

  test('gracefully displays degraded state and parsed message on API error', async ({ page }) => {
    await page.route('/api/status', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 503,
          code: 'SERVICE_UNAVAILABLE',
          message: 'Backend maintenance in progress',
        }),
      });
    });

    await page.goto('/');
    await expect(page.getByText('Degraded')).toBeVisible();
    await expect(page.getByText('Backend maintenance in progress')).toBeVisible();
  });
});
