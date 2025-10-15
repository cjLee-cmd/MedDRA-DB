import { test, expect } from '@playwright/test';

test.describe('CRUD Operations Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should create a new form', async ({ page }) => {
    await page.click('button:has-text("폼 생성")');
    await page.waitForSelector('#crud-test-result', { state: 'visible' });

    const resultText = await page.locator('#crud-test-result').textContent();
    expect(resultText).toContain('Create Form Test: SUCCESS');
    expect(resultText).toContain('Created Form ID:');
    expect(resultText).toContain('Control Number: TEST-');

    // Verify form count increased
    const formCount = await page.locator('#summary-form-count').textContent();
    expect(parseInt(formCount)).toBeGreaterThanOrEqual(1);
  });

  test('should update an existing form', async ({ page }) => {
    // First create a form
    await page.click('button:has-text("폼 생성")');
    await page.waitForSelector('#crud-test-result:has-text("Create Form Test: SUCCESS")', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Then update it
    await page.click('button:has-text("폼 수정")');
    await page.waitForSelector('#crud-test-result:has-text("Update Form Test: SUCCESS")', { timeout: 5000 });

    const resultText = await page.locator('#crud-test-result').textContent();
    expect(resultText).toContain('Update Form Test: SUCCESS');
    expect(resultText).toContain('Updated Form ID:');
    expect(resultText).toContain('Original Control No');
    expect(resultText).toContain('Updated Control No');
    expect(resultText).toContain('-UPDATED');

    // Verify age was updated
    expect(resultText).toContain('31 Years');
  });

  test('should delete a form', async ({ page }) => {
    // First create a form
    await page.click('button:has-text("폼 생성")');
    await page.waitForSelector('#crud-test-result:has-text("Create Form Test: SUCCESS")', { timeout: 5000 });
    await page.waitForTimeout(500);

    const countBefore = await page.locator('#summary-form-count').textContent();

    // Setup dialog handler for confirmation
    page.on('dialog', dialog => dialog.accept());

    // Delete the form
    await page.click('button:has-text("폼 삭제")');
    await page.waitForSelector('#crud-test-result:has-text("Delete Form Test: SUCCESS")', { timeout: 5000 });

    const resultText = await page.locator('#crud-test-result').textContent();
    expect(resultText).toContain('Delete Form Test: SUCCESS');
    expect(resultText).toContain('Deleted Form ID:');

    // Verify form count decreased
    await page.waitForTimeout(500);
    const countAfter = await page.locator('#summary-form-count').textContent();
    expect(parseInt(countAfter)).toBeLessThan(parseInt(countBefore));
  });

  test('should handle CRUD operations sequentially', async ({ page }) => {
    // Create
    await page.click('button:has-text("폼 생성")');
    await page.waitForSelector('#crud-test-result:has-text("Create Form Test: SUCCESS")', { timeout: 5000 });
    let resultText = await page.locator('#crud-test-result').textContent();
    expect(resultText).toContain('Create Form Test: SUCCESS');

    await page.waitForTimeout(500);

    // Update
    await page.click('button:has-text("폼 수정")');
    await page.waitForSelector('#crud-test-result:has-text("Update Form Test: SUCCESS")', { timeout: 5000 });
    resultText = await page.locator('#crud-test-result').textContent();
    expect(resultText).toContain('Update Form Test: SUCCESS');

    await page.waitForTimeout(500);

    // Delete
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("폼 삭제")');
    await page.waitForSelector('#crud-test-result:has-text("Delete Form Test: SUCCESS")', { timeout: 5000 });
    resultText = await page.locator('#crud-test-result').textContent();
    expect(resultText).toContain('Delete Form Test: SUCCESS');
  });
});
