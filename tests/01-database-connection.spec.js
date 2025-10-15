import { test, expect } from '@playwright/test';

test.describe('Database Connection Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test.html');
    await page.waitForLoadState('networkidle');
  });

  test('should initialize IndexedDB connection', async ({ page }) => {
    // Wait for auto-initialization
    await page.waitForTimeout(1000);

    // Check database status badge
    const statusBadge = page.locator('#summary-db-status');
    await expect(statusBadge).toContainText('연결됨');

    // Click connection test button
    await page.click('button:has-text("연결 테스트")');

    // Wait for test result
    await page.waitForSelector('#db-test-result', { state: 'visible' });

    // Verify success message
    const resultText = await page.locator('#db-test-result').textContent();
    expect(resultText).toContain('Database Connection Test: PASSED');
    expect(resultText).toContain('Database Name: CiomsFormDB');
    expect(resultText).toContain('Version: 1');
  });

  test('should display all object stores', async ({ page }) => {
    await page.click('button:has-text("연결 테스트")');
    await page.waitForSelector('#db-test-result', { state: 'visible' });

    const resultText = await page.locator('#db-test-result').textContent();

    // Verify all 7 object stores exist
    expect(resultText).toContain('forms');
    expect(resultText).toContain('patient_info');
    expect(resultText).toContain('adverse_reactions');
    expect(resultText).toContain('suspected_drugs');
    expect(resultText).toContain('lab_results');
    expect(resultText).toContain('causality_assessment');
    expect(resultText).toContain('audit_logs');
  });
});
