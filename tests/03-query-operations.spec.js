import { test, expect } from '@playwright/test';

test.describe('Query Operations Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Generate sample data first
    await page.click('button:has-text("샘플 폼 3개 생성")');
    await page.waitForSelector('#sample-data-result', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('should retrieve all forms', async ({ page }) => {
    await page.click('button:has-text("전체 폼 조회")');
    await page.waitForSelector('#query-test-result', { state: 'visible' });

    const resultText = await page.locator('#query-test-result').textContent();
    expect(resultText).toContain('Get All Forms Test: SUCCESS');
    expect(resultText).toContain('Total forms in database:');
    expect(resultText).toContain('Returned:');
  });

  test('should search forms by country', async ({ page }) => {
    await page.click('button:has-text("검색 테스트")');
    await page.waitForSelector('#query-test-result', { state: 'visible' });

    const resultText = await page.locator('#query-test-result').textContent();
    expect(resultText).toContain('Search Forms Test: SUCCESS');
    expect(resultText).toContain('country');
    expect(resultText).toContain('GERMANY');
  });

  test('should count total forms', async ({ page }) => {
    await page.click('button:has-text("폼 개수 확인")');
    await page.waitForSelector('#query-test-result', { state: 'visible' });

    const resultText = await page.locator('#query-test-result').textContent();
    expect(resultText).toContain('Form Count Test: SUCCESS');
    expect(resultText).toContain('Total forms:');

    // Verify count matches expected
    const match = resultText.match(/Total forms: (\d+)/);
    expect(match).toBeTruthy();
    const count = parseInt(match[1]);
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
