import { test, expect } from '@playwright/test';

test.describe('Main Page UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Generate sample data
    await page.click('button:has-text("샘플 폼 3개 생성")');
    await page.waitForSelector('#sample-data-result', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('should load main page and display forms', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify header
    await expect(page.locator('.logo')).toContainText('CIOMS-I');

    // Verify form count badge
    const formCountBadge = page.locator('#form-count');
    const count = await formCountBadge.textContent();
    expect(parseInt(count)).toBeGreaterThanOrEqual(3);

    // Verify table is visible
    await expect(page.locator('#forms-table')).toBeVisible();

    // Verify at least one row exists
    const rows = page.locator('#forms-tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('should display form data in table', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check first row has data
    const firstRow = page.locator('#forms-tbody tr').first();
    await expect(firstRow).toBeVisible();

    // Verify columns are populated
    const cells = firstRow.locator('td');
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThanOrEqual(6);
  });

  test('should have search form visible', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Verify search form exists
    const searchForm = page.locator('#search-form');
    await expect(searchForm).toBeVisible();

    // Verify search fields
    await expect(page.locator('#search-control-no')).toBeVisible();
    await expect(page.locator('#search-patient-initials')).toBeVisible();
    await expect(page.locator('#search-country')).toBeVisible();
  });

  test('should have action buttons for each form', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify action buttons exist in first row
    const firstRow = page.locator('#forms-tbody tr').first();
    await expect(firstRow.locator('button:has-text("삭제")')).toBeVisible();
    await expect(firstRow.locator('a:has-text("보기")')).toBeVisible();
    await expect(firstRow.locator('a:has-text("수정")')).toBeVisible();
  });

  test('should show pagination controls', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Verify pagination elements
    await expect(page.locator('#prev-page')).toBeVisible();
    await expect(page.locator('#next-page')).toBeVisible();
    await expect(page.locator('#page-info')).toBeVisible();
  });
});
