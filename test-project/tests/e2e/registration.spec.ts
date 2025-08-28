import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Registration flow', () => {

  test('positive: successful registration via UI', async ({ page, request }) => {
    await page.goto('/register');

    const email = `test+${Date.now()}@example.com`;
    const password = 'StrongPassw0rd!';

    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);
    await page.click('button[type="submit"]');

    // assertion: redirect to dashboard or show success message
    await expect(page).toHaveURL(/dashboard|home/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('negative: registration fails with existing email', async ({ page, request }) => {
    // Optionally create user via API to guarantee duplicate
    const existingEmail = 'already@existing.test';
    await request.post('/api/test-seed/user', { data: { email: existingEmail, password: 'P@ssword1' } });

    await page.goto('/register');
    await page.fill('#email', existingEmail);
    await page.fill('#password', 'P@ssword1');
    await page.fill('#confirmPassword', 'P@ssword1');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email already exists')).toBeVisible();
  });

  test('negative: invalid email format shows error', async ({ page }) => {
    await page.goto('/register');
    await page.fill('#email', 'not-an-email');
    await page.fill('#password', 'P@ssword1');
    await page.fill('#confirmPassword', 'P@ssword1');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Enter a valid email')).toBeVisible();
  });

});
