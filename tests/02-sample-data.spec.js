import { test, expect } from '@playwright/test';

test.describe('Sample Data Generation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should generate 3 sample forms', async ({ page }) => {
    // Click "샘플 폼 3개 생성" button
    await page.click('button:has-text("샘플 폼 3개 생성")');

    // Wait for result
    await page.waitForSelector('#sample-data-result', { state: 'visible', timeout: 10000 });

    // Verify success
    const resultText = await page.locator('#sample-data-result').textContent();
    expect(resultText).toContain('Sample Data Generation: SUCCESS');
    expect(resultText).toContain('Created: 3 forms');

    // Verify form count updated
    const formCount = await page.locator('#summary-form-count').textContent();
    expect(parseInt(formCount)).toBeGreaterThanOrEqual(3);

    // Verify toast notification
    const toast = page.locator('#toast');
    await expect(toast).toContainText('샘플 폼이 생성되었습니다');
  });

  test('should generate 10 sample forms', async ({ page }) => {
    await page.click('button:has-text("샘플 폼 10개 생성")');
    await page.waitForSelector('#sample-data-result', { state: 'visible', timeout: 10000 });

    const resultText = await page.locator('#sample-data-result').textContent();
    expect(resultText).toContain('Created: 10 forms');

    const formCount = await page.locator('#summary-form-count').textContent();
    expect(parseInt(formCount)).toBeGreaterThanOrEqual(10);
  });

  test('should track generation performance', async ({ page }) => {
    await page.click('button:has-text("샘플 폼 3개 생성")');
    await page.waitForSelector('#sample-data-result', { state: 'visible', timeout: 10000 });

    const resultText = await page.locator('#sample-data-result').textContent();

    // Verify performance metrics are displayed
    expect(resultText).toContain('Duration:');
    expect(resultText).toContain('ms');
    expect(resultText).toContain('Average:');
  });
});
