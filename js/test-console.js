/**
 * Test Console
 * Testing and debugging utilities
 */

import db from './db/database.js';
import Form from './models/Form.js';
import { generateSampleForms, clearAllData as clearData } from './utils/sample-data.js';
import { showToast, formatDateTime } from './app.js';

// Test state
let lastCreatedFormId = null;

// Display result helper
function displayResult(elementId, content, type = 'success') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
        element.className = `test-result ${type}`;
        element.style.display = 'block';
    }

    updateLastTest();
}

// Update test summary
function updateLastTest() {
    const element = document.getElementById('summary-last-test');
    if (element) {
        element.textContent = formatDateTime(new Date().toISOString());
    }
}

async function updateFormCount() {
    try {
        const count = await Form.count();
        const element = document.getElementById('summary-form-count');
        if (element) {
            element.textContent = count;
        }
    } catch (error) {
        console.error('Error updating form count:', error);
    }
}

// 1. Database Connection Test
window.testDatabaseConnection = async function() {
    console.log('Testing database connection...');

    try {
        await db.init();

        const result = `✓ Database Connection Test: PASSED

Database Name: ${db.db.name}
Version: ${db.db.version}
Object Stores: ${Array.from(db.db.objectStoreNames).join(', ')}

Status: Connected successfully`;

        displayResult('db-test-result', result, 'success');

        // Update summary
        const statusElement = document.getElementById('summary-db-status');
        if (statusElement) {
            statusElement.innerHTML = '<span class="status-badge success">연결됨</span>';
        }

        showToast('데이터베이스 연결 성공', 'success');

    } catch (error) {
        const result = `✗ Database Connection Test: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('db-test-result', result, 'error');

        // Update summary
        const statusElement = document.getElementById('summary-db-status');
        if (statusElement) {
            statusElement.innerHTML = '<span class="status-badge error">오류</span>';
        }

        showToast('데이터베이스 연결 실패', 'error');
    }
};

// 2. Create Sample Data
window.createSampleData = async function(count = 3) {
    console.log(`Creating ${count} sample forms...`);

    const startTime = Date.now();

    try {
        const result = await generateSampleForms(count);
        const endTime = Date.now();
        const duration = endTime - startTime;

        const output = `✓ Sample Data Generation: SUCCESS

Created: ${result.formIds.length} forms
Failed: ${result.errors.length} forms
Duration: ${duration}ms
Average: ${(duration / count).toFixed(2)}ms per form

Form IDs: ${result.formIds.join(', ')}

${result.errors.length > 0 ? `\nErrors:\n${JSON.stringify(result.errors, null, 2)}` : ''}`;

        displayResult('sample-data-result', output, 'success');
        await updateFormCount();
        showToast(`${result.formIds.length}개의 샘플 폼이 생성되었습니다`, 'success');

        // Store first ID for testing
        if (result.formIds.length > 0) {
            lastCreatedFormId = result.formIds[0];
        }

    } catch (error) {
        const output = `✗ Sample Data Generation: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('sample-data-result', output, 'error');
        showToast('샘플 데이터 생성 실패', 'error');
    }
};

// 3. Test Get All Forms
window.testGetAllForms = async function() {
    console.log('Testing getAll forms...');

    try {
        const result = await Form.getAll({ limit: 10 });

        const output = `✓ Get All Forms Test: SUCCESS

Total forms in database: ${result.total}
Returned: ${result.forms.length}
Offset: ${result.offset}
Limit: ${result.limit}

Forms:
${JSON.stringify(result.forms.map(f => ({
    id: f.id,
    control_no: f.manufacturer_control_no,
    date: f.date_received
})), null, 2)}`;

        displayResult('query-test-result', output, 'success');
        await updateFormCount();
        showToast(`${result.total}개의 폼을 조회했습니다`, 'success');

    } catch (error) {
        const output = `✗ Get All Forms Test: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('query-test-result', output, 'error');
        showToast('폼 조회 실패', 'error');
    }
};

// 4. Test Search Forms
window.testSearchForms = async function() {
    console.log('Testing search forms...');

    try {
        const criteria = {
            country: 'GERMANY',
            limit: 10
        };

        const results = await Form.search(criteria);

        const output = `✓ Search Forms Test: SUCCESS

Search Criteria: ${JSON.stringify(criteria, null, 2)}

Results: ${results.length} forms found

Forms:
${JSON.stringify(results.map(f => ({
    id: f.id,
    control_no: f.manufacturer_control_no,
    date: f.date_received
})), null, 2)}`;

        displayResult('query-test-result', output, 'success');
        showToast(`${results.length}개의 폼을 찾았습니다`, 'success');

    } catch (error) {
        const output = `✗ Search Forms Test: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('query-test-result', output, 'error');
        showToast('폼 검색 실패', 'error');
    }
};

// 5. Test Form Count
window.testFormCount = async function() {
    console.log('Testing form count...');

    try {
        const count = await Form.count();

        const output = `✓ Form Count Test: SUCCESS

Total forms: ${count}`;

        displayResult('query-test-result', output, 'success');
        await updateFormCount();
        showToast(`총 ${count}개의 폼`, 'success');

    } catch (error) {
        const output = `✗ Form Count Test: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('query-test-result', output, 'error');
        showToast('폼 개수 조회 실패', 'error');
    }
};

// 6. Test Create Form
window.testCreateForm = async function() {
    console.log('Testing create form...');

    const formData = {
        manufacturer_control_no: `TEST-${Date.now()}`,
        date_received: new Date().toISOString(),
        patient_info: {
            initials: 'TST',
            country: 'TEST COUNTRY',
            age: '30 Years',
            sex: 'M'
        },
        adverse_reactions: [
            { reaction_en: 'TEST REACTION', reaction_ko: '테스트 반응' }
        ],
        suspected_drugs: [
            {
                drug_name_en: 'Test Drug',
                drug_name_ko: '테스트 약물',
                indication_en: 'Testing',
                indication_ko: '테스트',
                is_suspected: true
            }
        ],
        lab_results: [],
        causality_assessment: {
            assessment_data: {
                method: 'TEST',
                category: 'Test',
                assessed_by: 'Tester'
            }
        }
    };

    try {
        const formId = await Form.create(formData);
        lastCreatedFormId = formId;

        const output = `✓ Create Form Test: SUCCESS

Created Form ID: ${formId}
Control Number: ${formData.manufacturer_control_no}

Form Data:
${JSON.stringify(formData, null, 2)}`;

        displayResult('crud-test-result', output, 'success');
        await updateFormCount();
        showToast(`폼이 생성되었습니다 (ID: ${formId})`, 'success');

    } catch (error) {
        const output = `✗ Create Form Test: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('crud-test-result', output, 'error');
        showToast('폼 생성 실패', 'error');
    }
};

// 7. Test Update Form
window.testUpdateForm = async function() {
    console.log('Testing update form...');

    if (!lastCreatedFormId) {
        const output = `⚠ Update Form Test: SKIPPED

No form ID available. Please create a form first.`;
        displayResult('crud-test-result', output, 'error');
        showToast('먼저 폼을 생성하세요', 'warning');
        return;
    }

    try {
        // Get existing form
        const form = await Form.getById(lastCreatedFormId);

        if (!form) {
            throw new Error(`Form not found: ${lastCreatedFormId}`);
        }

        // Update form
        const updatedData = {
            manufacturer_control_no: form.manufacturer_control_no + '-UPDATED',
            patient_info: {
                ...form.patient_info,
                age: '31 Years'
            }
        };

        await Form.update(lastCreatedFormId, updatedData);

        // Get updated form
        const updatedForm = await Form.getById(lastCreatedFormId);

        const output = `✓ Update Form Test: SUCCESS

Updated Form ID: ${lastCreatedFormId}

Original Control No: ${form.manufacturer_control_no}
Updated Control No: ${updatedForm.manufacturer_control_no}

Original Age: ${form.patient_info.age}
Updated Age: ${updatedForm.patient_info.age}`;

        displayResult('crud-test-result', output, 'success');
        showToast('폼이 수정되었습니다', 'success');

    } catch (error) {
        const output = `✗ Update Form Test: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('crud-test-result', output, 'error');
        showToast('폼 수정 실패', 'error');
    }
};

// 8. Test Delete Form
window.testDeleteForm = async function() {
    console.log('Testing delete form...');

    if (!lastCreatedFormId) {
        const output = `⚠ Delete Form Test: SKIPPED

No form ID available. Please create a form first.`;
        displayResult('crud-test-result', output, 'error');
        showToast('먼저 폼을 생성하세요', 'warning');
        return;
    }

    const confirmed = window.confirm(`폼 ID ${lastCreatedFormId}를 삭제하시겠습니까?`);

    if (!confirmed) {
        showToast('삭제가 취소되었습니다', 'warning');
        return;
    }

    try {
        await Form.delete(lastCreatedFormId);

        const output = `✓ Delete Form Test: SUCCESS

Deleted Form ID: ${lastCreatedFormId}`;

        displayResult('crud-test-result', output, 'success');
        await updateFormCount();
        showToast('폼이 삭제되었습니다', 'success');

        lastCreatedFormId = null;

    } catch (error) {
        const output = `✗ Delete Form Test: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('crud-test-result', output, 'error');
        showToast('폼 삭제 실패', 'error');
    }
};

// 9. Test Export Data
window.testExportData = async function() {
    console.log('Testing export data...');

    try {
        const exportData = await db.exportData();

        const output = `✓ Export Data Test: SUCCESS

Export Summary:
- Version: ${exportData.version}
- Exported at: ${exportData.exported_at}

Data counts:
${Object.entries(exportData.data).map(([store, records]) =>
    `- ${store}: ${records.length} records`
).join('\n')}

Note: Data exported to console. Check browser console for full export.`;

        console.log('Exported Data:', exportData);

        displayResult('export-test-result', output, 'success');
        showToast('데이터가 내보내기되었습니다 (콘솔 확인)', 'success');

        // Optionally download as JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cioms-export-${Date.now()}.json`;
        link.click();

    } catch (error) {
        const output = `✗ Export Data Test: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('export-test-result', output, 'error');
        showToast('데이터 내보내기 실패', 'error');
    }
};

// 10. Test Import Data
window.testImportData = async function() {
    const output = `ℹ Import Data Test: INFO

Import functionality requires a JSON file.

To test import:
1. Export data first using "Export Data" button
2. Implement file upload UI in import-export.html
3. Use db.importData(jsonData, clearFirst) method

Example usage in console:
  const data = { version: 1, data: {...} };
  await db.importData(data, false);`;

    displayResult('export-test-result', output, 'success');
    showToast('가져오기는 파일 업로드가 필요합니다', 'warning');
};

// 11. Clear All Data
window.clearAllData = async function() {
    console.log('Clearing all data...');

    try {
        const result = await clearData();

        if (result.success) {
            const output = `✓ Clear All Data: SUCCESS

All data has been removed from the database.`;

            displayResult('clear-test-result', output, 'success');
            await updateFormCount();
            lastCreatedFormId = null;
        } else {
            const output = `⚠ Clear All Data: CANCELLED

${result.message}`;
            displayResult('clear-test-result', output, 'error');
        }

    } catch (error) {
        const output = `✗ Clear All Data: FAILED

Error: ${error.message}

Stack trace:
${error.stack}`;

        displayResult('clear-test-result', output, 'error');
        showToast('데이터 삭제 실패', 'error');
    }
};

// Initialize on load
async function initTestConsole() {
    console.log('Test Console initialized');

    // Auto-run database connection test
    await testDatabaseConnection();
    await updateFormCount();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestConsole);
} else {
    initTestConsole();
}
