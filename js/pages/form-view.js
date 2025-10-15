/**
 * Form View Page
 * Display detailed form information
 */

import Form from '../models/Form.js';
import { showLoading, showToast, showError, initApp } from '../app.js';

let currentFormId = null;

// Initialize page
async function initPage() {
    try {
        await initApp();

        // Get form ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        currentFormId = urlParams.get('id');

        if (!currentFormId) {
            showError('폼 ID가 지정되지 않았습니다.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        await loadFormData(parseInt(currentFormId));

    } catch (error) {
        console.error('Error initializing page:', error);
        showError('페이지 초기화 실패: ' + error.message);
    }
}

// Load form data
async function loadFormData(formId) {
    showLoading(true);
    try {
        const form = await Form.getById(formId);
        if (!form) {
            throw new Error('폼을 찾을 수 없습니다.');
        }

        // Display basic information
        document.getElementById('view-control-no').textContent = form.manufacturer_control_no || '-';
        document.getElementById('view-date-received').textContent = formatDate(form.date_received);
        document.getElementById('view-created-at').textContent = formatDateTime(form.created_at);
        document.getElementById('view-updated-at').textContent = formatDateTime(form.updated_at);

        // Display patient information
        if (form.patient_info) {
            document.getElementById('view-patient-initials').textContent = form.patient_info.initials || '-';
            document.getElementById('view-patient-country').textContent = form.patient_info.country || '-';
            document.getElementById('view-patient-age').textContent = form.patient_info.age || '-';
            document.getElementById('view-patient-sex').textContent = formatSex(form.patient_info.sex);
        }

        // Display adverse reactions
        if (form.adverse_reactions && form.adverse_reactions.length > 0) {
            const reactionsList = document.getElementById('view-adverse-reactions');
            reactionsList.innerHTML = '';
            form.adverse_reactions.forEach((reaction, index) => {
                const li = document.createElement('li');
                li.className = 'view-list-item';
                li.innerHTML = `
                    <h4>부작용 #${index + 1}</h4>
                    <div class="bilingual-value">
                        <div>
                            <strong>영어:</strong> ${reaction.reaction_en || '-'}
                        </div>
                        <div>
                            <strong>한글:</strong> ${reaction.reaction_ko || '-'}
                        </div>
                    </div>
                `;
                reactionsList.appendChild(li);
            });
        }

        // Display suspected drugs
        if (form.suspected_drugs && form.suspected_drugs.length > 0) {
            const drugsList = document.getElementById('view-suspected-drugs');
            drugsList.innerHTML = '';
            form.suspected_drugs.forEach((drug, index) => {
                const li = document.createElement('li');
                li.className = 'view-list-item';
                li.innerHTML = `
                    <h4>약물 #${index + 1} ${drug.is_suspected ? '(의심 약물)' : '(병용 약물)'}</h4>
                    <div class="view-grid">
                        <div>
                            <strong>약물명 (영어):</strong> ${drug.drug_name_en || '-'}
                        </div>
                        <div>
                            <strong>약물명 (한글):</strong> ${drug.drug_name_ko || '-'}
                        </div>
                        <div>
                            <strong>적응증 (영어):</strong> ${drug.indication_en || '-'}
                        </div>
                        <div>
                            <strong>적응증 (한글):</strong> ${drug.indication_ko || '-'}
                        </div>
                    </div>
                `;
                drugsList.appendChild(li);
            });
        }

        // Display lab results
        if (form.lab_results && form.lab_results.length > 0) {
            const labList = document.getElementById('view-lab-results');
            labList.innerHTML = '';
            form.lab_results.forEach((lab, index) => {
                const li = document.createElement('li');
                li.className = 'view-list-item';
                li.innerHTML = `
                    <h4>검사 #${index + 1}</h4>
                    <div class="view-grid">
                        <div>
                            <strong>검사명:</strong> ${lab.test_name || '-'}
                        </div>
                        <div>
                            <strong>결과값:</strong> ${lab.result_value || '-'} ${lab.unit || ''}
                        </div>
                        <div>
                            <strong>정상 범위:</strong> ${lab.normal_range || '-'}
                        </div>
                        <div>
                            <strong>검사일:</strong> ${formatDate(lab.date_performed)}
                        </div>
                    </div>
                `;
                labList.appendChild(li);
            });
        }

        // Display causality assessment
        if (form.causality_assessment && form.causality_assessment.assessment_data) {
            const data = form.causality_assessment.assessment_data;
            document.getElementById('view-causality-method').textContent = data.method || '-';
            document.getElementById('view-causality-category').textContent = data.category || '-';
            document.getElementById('view-causality-reason').textContent = data.reason || '-';
            document.getElementById('view-causality-assessed-by').textContent = data.assessed_by || '-';
            document.getElementById('view-causality-assessed-date').textContent = formatDate(data.assessed_date);
        }

    } catch (error) {
        console.error('Error loading form:', error);
        showError('폼 로드 실패: ' + error.message);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } finally {
        showLoading(false);
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// Format datetime
function formatDateTime(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// Format sex
function formatSex(sex) {
    const sexMap = {
        'M': '남성 (M)',
        'F': '여성 (F)',
        'Unknown': '알 수 없음'
    };
    return sexMap[sex] || sex || '-';
}

// Edit form
window.editForm = function() {
    if (currentFormId) {
        window.location.href = `form-edit.html?id=${currentFormId}`;
    }
};

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
