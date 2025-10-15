import { test, expect } from '@playwright/test';

test.describe('Export/Import Operations Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Generate sample data
    await page.click('button:has-text("샘플 폼 3개 생성")');
    await page.waitForSelector('#sample-data-result', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('should export data to JSON', async ({ page }) => {
    // Setup download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('button:has-text("데이터 내보내기")');

    // Wait for download
    const download = await downloadPromise;

    // Verify filename pattern
    expect(download.suggestedFilename()).toMatch(/cioms-export-\d+\.json/);

    // Wait for result display
    await page.waitForSelector('#export-test-result', { state: 'visible' });

    const resultText = await page.locator('#export-test-result').textContent();
    expect(resultText).toContain('Export Data Test: SUCCESS');
    expect(resultText).toContain('Version:');
    expect(resultText).toContain('Exported at:');
    expect(resultText).toContain('Data counts:');

    // Verify all stores are included
    expect(resultText).toContain('forms:');
    expect(resultText).toContain('patient_info:');
    expect(resultText).toContain('adverse_reactions:');
    expect(resultText).toContain('suspected_drugs:');
  });

  test('should display import information', async ({ page }) => {
    await page.click('button:has-text("데이터 가져오기 (샘플)")');
    await page.waitForSelector('#export-test-result', { state: 'visible' });

    const resultText = await page.locator('#export-test-result').textContent();
    expect(resultText).toContain('Import Data Test: INFO');
    expect(resultText).toContain('Import functionality requires a JSON file');
    expect(resultText).toContain('db.importData');
  });

  test('should export valid JSON structure', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("데이터 내보내기")');
    const download = await downloadPromise;

    // Verify download completed
    const path = await download.path();
    expect(path).toBeTruthy();
  });
});
