import { test, expect, Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/dashboard');
});

test.describe('init screen', () => {
  //@TODO
});
