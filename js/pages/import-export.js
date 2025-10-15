/**
 * Import/Export Page
 * Data import and export functionality
 */

import Form from '../models/Form.js';
import { showLoading, showToast, initApp } from '../app.js';

let pendingImportData = null;

// Initialize page
async function initPage() {
    try {
        await initApp();
        await updateStats();
        setupDragAndDrop();
    } catch (error) {
        console.error('Error initializing page:', error);
        showToast('페이지 초기화 실패: ' + error.message, 'error');
    }
}

// Update database statistics
async function updateStats() {
    try {
        const forms = await Form.getAll();

        // Count forms
        document.getElementById('stat-forms').textContent = forms.length;
        document.getElementById('form-count').textContent = forms.length;

        // Count patients (should match forms count)
        document.getElementById('stat-patients').textContent = forms.length;

        // Count adverse reactions
        let reactionsCount = 0;
        for (const form of forms) {
            const reactions = await Form.getAdverseReactions(form.id);
            reactionsCount += reactions.length;
        }
        document.getElementById('stat-reactions').textContent = reactionsCount;

        // Count suspected drugs
        let drugsCount = 0;
        for (const form of forms) {
            const drugs = await Form.getSuspectedDrugs(form.id);
            drugsCount += drugs.length;
        }
        document.getElementById('stat-drugs').textContent = drugsCount;

    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Export all data
window.exportAllData = async function() {
    showLoading(true);
    try {
        const data = await Form.exportToJSON();

        // Show preview
        const preview = document.getElementById('export-result');
        preview.style.display = 'block';
        preview.textContent = JSON.stringify(data, null, 2).substring(0, 500) + '\n\n... (미리보기)';

        // Download file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cioms-forms-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('데이터를 성공적으로 내보냈습니다', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('데이터 내보내기 실패: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

// Export forms only (without related data)
window.exportFormsOnly = async function() {
    showLoading(true);
    try {
        const forms = await Form.getAll();

        const data = {
            version: '1.0.0',
            exported_at: new Date().toISOString(),
            forms: forms
        };

        // Show preview
        const preview = document.getElementById('export-result');
        preview.style.display = 'block';
        preview.textContent = JSON.stringify(data, null, 2).substring(0, 500) + '\n\n... (미리보기)';

        // Download file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cioms-forms-only-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('폼 데이터를 성공적으로 내보냈습니다', 'success');
    } catch (error) {
        console.error('Error exporting forms:', error);
        showToast('폼 내보내기 실패: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

// Setup drag and drop
function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

// Handle file selection
window.handleFileSelect = function(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
};

// Handle file
async function handleFile(file) {
    if (!file.name.endsWith('.json')) {
        showToast('JSON 파일만 선택할 수 있습니다', 'error');
        return;
    }

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate data structure
        if (!data.forms || !Array.isArray(data.forms)) {
            showToast('잘못된 데이터 형식입니다. forms 배열이 필요합니다.', 'error');
            return;
        }

        // Store pending import data
        pendingImportData = data;

        // Show preview
        const preview = document.getElementById('import-preview');
        preview.style.display = 'block';
        preview.innerHTML = `
            <strong>가져올 데이터:</strong><br>
            - 버전: ${data.version || 'N/A'}<br>
            - 내보낸 날짜: ${data.exported_at || 'N/A'}<br>
            - 폼 수: ${data.forms.length}<br>
            - 환자 정보: ${data.patient_info?.length || 0}<br>
            - 부작용: ${data.adverse_reactions?.length || 0}<br>
            - 약물: ${data.suspected_drugs?.length || 0}<br>
            - 검사 결과: ${data.lab_results?.length || 0}<br>
            <br>
            <pre>${JSON.stringify(data, null, 2).substring(0, 300)}...</pre>
        `;

        // Show import actions
        document.getElementById('import-actions').style.display = 'block';

    } catch (error) {
        console.error('Error reading file:', error);
        showToast('파일 읽기 실패: ' + error.message, 'error');
    }
}

// Confirm import
window.confirmImport = async function() {
    if (!pendingImportData) {
        showToast('가져올 데이터가 없습니다', 'error');
        return;
    }

    showLoading(true);
    try {
        const result = await Form.importFromJSON(pendingImportData);

        // Show result
        const resultDiv = document.getElementById('import-result');
        resultDiv.style.display = 'block';
        resultDiv.className = 'alert alert-success';
        resultDiv.innerHTML = `
            <strong>✅ 가져오기 완료</strong><br>
            - 폼: ${result.forms} 개<br>
            - 환자 정보: ${result.patient_info} 개<br>
            - 부작용: ${result.adverse_reactions} 개<br>
            - 약물: ${result.suspected_drugs} 개<br>
            - 검사 결과: ${result.lab_results} 개<br>
            - 인과관계 평가: ${result.causality_assessment} 개
        `;

        // Hide preview and actions
        document.getElementById('import-preview').style.display = 'none';
        document.getElementById('import-actions').style.display = 'none';

        // Clear pending data
        pendingImportData = null;

        // Update stats
        await updateStats();

        showToast('데이터를 성공적으로 가져왔습니다', 'success');

    } catch (error) {
        console.error('Error importing data:', error);
        const resultDiv = document.getElementById('import-result');
        resultDiv.style.display = 'block';
        resultDiv.className = 'alert alert-error';
        resultDiv.innerHTML = `<strong>❌ 가져오기 실패:</strong> ${error.message}`;
        showToast('데이터 가져오기 실패: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

// Cancel import
window.cancelImport = function() {
    pendingImportData = null;
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('import-actions').style.display = 'none';
    document.getElementById('import-result').style.display = 'none';
    document.getElementById('file-input').value = '';
};

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
