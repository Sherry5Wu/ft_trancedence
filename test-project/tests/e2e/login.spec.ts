import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {

  test.beforeEach(async ({ request }) => {
    // Optionally ensure a test user exists via API
    await request.post('/api/test-seed/user', { data: { email: 'e2euser@test', password: 'P@ssword1' } });
  });

  test('positive: login succeeds with correct credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2euser@test');
    await page.fill('#password', 'P@ssword1');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard|home/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('negative: login fails with wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'e2euser@test');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('negative: login fails for unregistered email', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'not_exist@test');
    await page.fill('#password', 'whatever');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=User not found')).toBeVisible();
  });

});
