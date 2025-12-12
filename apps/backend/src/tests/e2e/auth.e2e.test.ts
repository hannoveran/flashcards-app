/// <reference lib="dom" />

import { test, expect } from '@playwright/test';
import {
  DatabaseHelpers,
  AuthHelpers,
  TestDataGenerator,
} from './helpers/test-helpers';

// -----------------------------
//   E2E Authentication Tests
// -----------------------------
test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ context }) => {
    await DatabaseHelpers.cleanDatabase();

    await context.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.afterAll(async () => {
    await DatabaseHelpers.closeConnection();
  });

  // -----------------------------
  //   REGISTER
  // -----------------------------
  test('користувач може успішно зареєструватися', async ({ page }) => {
    const username = TestDataGenerator.generateUsername();
    const email = TestDataGenerator.generateEmail();
    const password = TestDataGenerator.defaultPassword();

    page.on('console', (msg) => console.log('Browser console:', msg.text()));
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        console.log(`${response.status()} ${response.url()}`);
        try {
          const text = await response.text();
          console.log('Response body:', text.substring(0, 200));
        } catch (e) {
          console.log(`Could not read response body ${e}`);
        }
      }
    });

    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    await page.fill('input[type="text"]', username);
    await page.fill('input[type="email"]', email);

    const passFields = page.locator('input[type="password"]');
    await passFields.nth(0).fill(password);
    await passFields.nth(1).fill(password);

    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);

    const errorVisible = await page
      .locator('.errorMessage')
      .isVisible()
      .catch(() => false);
    if (errorVisible) {
      const errorText = await page.locator('.errorMessage').textContent();
      console.log('Error message:', errorText);
    }

    const token = await AuthHelpers.getToken(page);
    console.log('Token exists:', !!token);

    if (token) {
      await expect(page).toHaveURL(/\/folder$/, { timeout: 2000 });

      const exists = await DatabaseHelpers.userExists(email);
      expect(exists).toBe(true);
    } else {
      throw new Error('Registration failed - no token received');
    }
  });

  // -----------------------------
  //   REGISTER WITH EXISTING EMAIL
  // -----------------------------
  test('показує помилку при реєстрації з існуючим email', async ({ page }) => {
    const email = 'exists@example.com';
    const password = TestDataGenerator.defaultPassword();

    await DatabaseHelpers.createTestUser('existingUser', email, password);

    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        console.log(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    await page.fill('input[type="text"]', 'newUser');
    await page.fill('input[type="email"]', email);

    const passFields = page.locator('input[type="password"]');
    await passFields.nth(0).fill(password);
    await passFields.nth(1).fill(password);

    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    await expect(page.locator('.errorMessage')).toBeVisible({ timeout: 3000 });
    await expect(page).toHaveURL(/\/register$/);
  });

  // -----------------------------
  //   LOGIN SUCCESS
  // -----------------------------
  test('користувач може успішно залогінитися', async ({ page }) => {
    const email = 'login@example.com';
    const password = 'LoginPass123!';

    await DatabaseHelpers.createTestUser('loginUser', email, password);

    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        console.log(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    const token = await AuthHelpers.getToken(page);
    console.log('Token exists:', !!token);

    if (token) {
      await expect(page).toHaveURL(/\/folder$/, { timeout: 2000 });
    } else {
      throw new Error('Login failed - no token received');
    }
  });

  // -----------------------------
  //   WRONG PASSWORD
  // -----------------------------
  test('показує помилку при невірному паролі', async ({ page }) => {
    const email = 'wrongpass@example.com';
    await DatabaseHelpers.createTestUser('user', email, 'CorrectPass123!');

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'IncorrectPassword!');

    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    await expect(page.locator('.errorMessage')).toBeVisible({ timeout: 3000 });
    await expect(page).toHaveURL(/\/login$/);
  });

  // -----------------------------
  //   UNAUTHORIZED ACCESS
  // -----------------------------
  test('неавторизований користувач НЕ потрапляє на /folder', async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/folder');

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    await expect(page).toHaveURL(/\/login$/);

    const token = await AuthHelpers.getToken(page);
    expect(token).toBeNull();
  });
});
