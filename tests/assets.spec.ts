import { test, expect, Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/assets');
});

test.describe('init screen', () => {
  //@TODO
});
