/**
 * Form Edit Page
 * CIOMS-I form creation and editing
 */

import Form from '../models/Form.js';
import { showLoading, showToast, showError, initApp } from '../app.js';

// Form state
let formId = null;
let adverseReactionsCount = 0;
let suspectedDrugsCount = 0;
let labResultsCount = 0;

// Initialize page
async function initPage() {
    try {
        await initApp();

        // Check if editing existing form
        const urlParams = new URLSearchParams(window.location.search);
        formId = urlParams.get('id');

        if (formId) {
            document.getElementById('page-title').textContent = 'CIOMS-I 폼 수정';
            await loadForm(parseInt(formId));
        } else {
            // Add initial empty items for new form
            addAdverseReaction();
            addSuspectedDrug();
        }

        // Setup form submission
        document.getElementById('cioms-form').addEventListener('submit', handleSubmit);

        // Setup date validation
        const dateInput = document.getElementById('date_received');
        dateInput.max = new Date().toISOString().split('T')[0];

    } catch (error) {
        console.error('Error initializing page:', error);
        showError('페이지 초기화 실패: ' + error.message);
    }
}

// Load existing form data
async function loadForm(id) {
    showLoading(true);
    try {
        const form = await Form.getById(id);
        if (!form) {
            throw new Error('폼을 찾을 수 없습니다');
        }

        // Populate basic info
        document.getElementById('manufacturer_control_no').value = form.manufacturer_control_no || '';
        document.getElementById('date_received').value = form.date_received ? form.date_received.split('T')[0] : '';

        // Populate patient info
        if (form.patient_info) {
            document.getElementById('patient_initials').value = form.patient_info.initials || '';
            document.getElementById('patient_country').value = form.patient_info.country || '';
            document.getElementById('patient_age').value = form.patient_info.age || '';
            document.getElementById('patient_sex').value = form.patient_info.sex || '';
        }

        // Populate adverse reactions
        if (form.adverse_reactions && form.adverse_reactions.length > 0) {
            form.adverse_reactions.forEach(reaction => {
                addAdverseReaction(reaction);
            });
        }

        // Populate suspected drugs
        if (form.suspected_drugs && form.suspected_drugs.length > 0) {
            form.suspected_drugs.forEach(drug => {
                addSuspectedDrug(drug);
            });
        }

        // Populate lab results
        if (form.lab_results && form.lab_results.length > 0) {
            form.lab_results.forEach(lab => {
                addLabResult(lab);
            });
        }

        // Populate causality assessment
        if (form.causality_assessment && form.causality_assessment.assessment_data) {
            const data = form.causality_assessment.assessment_data;
            document.getElementById('causality_method').value = data.method || '';
            document.getElementById('causality_category').value = data.category || '';
            document.getElementById('causality_reason').value = data.reason || '';
            document.getElementById('causality_assessed_by').value = data.assessed_by || '';
            if (data.assessed_date) {
                document.getElementById('causality_assessed_date').value = data.assessed_date.split('T')[0];
            }
        }

    } catch (error) {
        console.error('Error loading form:', error);
        showError('폼 로드 실패: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Add adverse reaction item
window.addAdverseReaction = function(data = null) {
    adverseReactionsCount++;
    const container = document.getElementById('adverse-reactions-container');
    const item = document.createElement('div');
    item.className = 'repeatable-item';
    item.id = `adverse-reaction-${adverseReactionsCount}`;

    item.innerHTML = `
        <div class="repeatable-item-header">
            <h4>부작용 #${adverseReactionsCount}</h4>
            <button type="button" class="btn-remove" onclick="removeItem('adverse-reaction-${adverseReactionsCount}')">
                삭제
            </button>
        </div>
        <div class="bilingual-input">
            <div class="form-group">
                <label>반응명 (영어)</label>
                <input type="text" name="reaction_en_${adverseReactionsCount}"
                       value="${data?.reaction_en || ''}" placeholder="예: NAUSEA">
            </div>
            <div class="form-group">
                <label>반응명 (한글)</label>
                <input type="text" name="reaction_ko_${adverseReactionsCount}"
                       value="${data?.reaction_ko || ''}" placeholder="예: 오심">
            </div>
        </div>
    `;

    container.appendChild(item);
};

// Add suspected drug item
window.addSuspectedDrug = function(data = null) {
    suspectedDrugsCount++;
    const container = document.getElementById('suspected-drugs-container');
    const item = document.createElement('div');
    item.className = 'repeatable-item';
    item.id = `suspected-drug-${suspectedDrugsCount}`;

    item.innerHTML = `
        <div class="repeatable-item-header">
            <h4>약물 #${suspectedDrugsCount}</h4>
            <button type="button" class="btn-remove" onclick="removeItem('suspected-drug-${suspectedDrugsCount}')">
                삭제
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>약물명 (영어)</label>
                <input type="text" name="drug_name_en_${suspectedDrugsCount}"
                       value="${data?.drug_name_en || ''}" placeholder="예: Aspirin">
            </div>
            <div class="form-group">
                <label>약물명 (한글)</label>
                <input type="text" name="drug_name_ko_${suspectedDrugsCount}"
                       value="${data?.drug_name_ko || ''}" placeholder="예: 아스피린">
            </div>
            <div class="form-group">
                <label>적응증 (영어)</label>
                <input type="text" name="indication_en_${suspectedDrugsCount}"
                       value="${data?.indication_en || ''}" placeholder="예: Pain relief">
            </div>
            <div class="form-group">
                <label>적응증 (한글)</label>
                <input type="text" name="indication_ko_${suspectedDrugsCount}"
                       value="${data?.indication_ko || ''}" placeholder="예: 진통">
            </div>
            <div class="form-group">
                <label>구분</label>
                <select name="is_suspected_${suspectedDrugsCount}">
                    <option value="true" ${data?.is_suspected === true ? 'selected' : ''}>의심 약물</option>
                    <option value="false" ${data?.is_suspected === false ? 'selected' : ''}>병용 약물</option>
                </select>
            </div>
        </div>
    `;

    container.appendChild(item);
};

// Add lab result item
window.addLabResult = function(data = null) {
    labResultsCount++;
    const container = document.getElementById('lab-results-container');
    const item = document.createElement('div');
    item.className = 'repeatable-item';
    item.id = `lab-result-${labResultsCount}`;

    item.innerHTML = `
        <div class="repeatable-item-header">
            <h4>검사 #${labResultsCount}</h4>
            <button type="button" class="btn-remove" onclick="removeItem('lab-result-${labResultsCount}')">
                삭제
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>검사명</label>
                <input type="text" name="test_name_${labResultsCount}"
                       value="${data?.test_name || ''}" placeholder="예: Creatinine">
            </div>
            <div class="form-group">
                <label>결과값</label>
                <input type="text" name="result_value_${labResultsCount}"
                       value="${data?.result_value || ''}" placeholder="예: 2.5">
            </div>
            <div class="form-group">
                <label>단위</label>
                <input type="text" name="unit_${labResultsCount}"
                       value="${data?.unit || ''}" placeholder="예: mg/dL">
            </div>
            <div class="form-group">
                <label>정상 범위</label>
                <input type="text" name="normal_range_${labResultsCount}"
                       value="${data?.normal_range || ''}" placeholder="예: 0.7-1.3">
            </div>
            <div class="form-group">
                <label>검사일</label>
                <input type="date" name="date_performed_${labResultsCount}"
                       value="${data?.date_performed ? data.date_performed.split('T')[0] : ''}">
            </div>
        </div>
    `;

    container.appendChild(item);
};

// Remove repeatable item
window.removeItem = function(itemId) {
    const item = document.getElementById(itemId);
    if (item) {
        item.remove();
    }
};

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
        showToast('입력 내용을 확인해주세요', 'error');
        return;
    }

    showLoading(true);

    try {
        const formData = collectFormData();

        if (formId) {
            // Update existing form
            await Form.update(formId, formData);
            showToast('폼이 수정되었습니다', 'success');
        } else {
            // Create new form
            const newFormId = await Form.create(formData);
            showToast('폼이 생성되었습니다', 'success');
            formId = newFormId;
        }

        // Redirect to form list after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Error saving form:', error);
        showError('폼 저장 실패: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Collect form data
function collectFormData() {
    const formData = {
        manufacturer_control_no: document.getElementById('manufacturer_control_no').value,
        date_received: new Date(document.getElementById('date_received').value).toISOString(),
        patient_info: {
            initials: document.getElementById('patient_initials').value,
            country: document.getElementById('patient_country').value,
            age: document.getElementById('patient_age').value,
            sex: document.getElementById('patient_sex').value
        },
        adverse_reactions: [],
        suspected_drugs: [],
        lab_results: [],
        causality_assessment: null
    };

    // Collect adverse reactions
    for (let i = 1; i <= adverseReactionsCount; i++) {
        const item = document.getElementById(`adverse-reaction-${i}`);
        if (item) {
            const reaction_en = document.querySelector(`input[name="reaction_en_${i}"]`)?.value || '';
            const reaction_ko = document.querySelector(`input[name="reaction_ko_${i}"]`)?.value || '';
            if (reaction_en || reaction_ko) {
                formData.adverse_reactions.push({ reaction_en, reaction_ko });
            }
        }
    }

    // Collect suspected drugs
    for (let i = 1; i <= suspectedDrugsCount; i++) {
        const item = document.getElementById(`suspected-drug-${i}`);
        if (item) {
            const drug_name_en = document.querySelector(`input[name="drug_name_en_${i}"]`)?.value || '';
            const drug_name_ko = document.querySelector(`input[name="drug_name_ko_${i}"]`)?.value || '';
            const indication_en = document.querySelector(`input[name="indication_en_${i}"]`)?.value || '';
            const indication_ko = document.querySelector(`input[name="indication_ko_${i}"]`)?.value || '';
            const is_suspected = document.querySelector(`select[name="is_suspected_${i}"]`)?.value === 'true';

            if (drug_name_en || drug_name_ko) {
                formData.suspected_drugs.push({
                    drug_name_en,
                    drug_name_ko,
                    indication_en,
                    indication_ko,
                    is_suspected
                });
            }
        }
    }

    // Collect lab results
    for (let i = 1; i <= labResultsCount; i++) {
        const item = document.getElementById(`lab-result-${i}`);
        if (item) {
            const test_name = document.querySelector(`input[name="test_name_${i}"]`)?.value || '';
            const result_value = document.querySelector(`input[name="result_value_${i}"]`)?.value || '';
            const unit = document.querySelector(`input[name="unit_${i}"]`)?.value || '';
            const normal_range = document.querySelector(`input[name="normal_range_${i}"]`)?.value || '';
            const date_performed_input = document.querySelector(`input[name="date_performed_${i}"]`)?.value || '';

            if (test_name) {
                formData.lab_results.push({
                    test_name,
                    result_value,
                    unit,
                    normal_range,
                    date_performed: date_performed_input ? new Date(date_performed_input).toISOString() : null
                });
            }
        }
    }

    // Collect causality assessment
    const method = document.getElementById('causality_method').value;
    const category = document.getElementById('causality_category').value;
    const reason = document.getElementById('causality_reason').value;
    const assessed_by = document.getElementById('causality_assessed_by').value;
    const assessed_date_input = document.getElementById('causality_assessed_date').value;

    if (method || category) {
        formData.causality_assessment = {
            assessment_data: {
                method,
                category,
                reason,
                assessed_by,
                assessed_date: assessed_date_input ? new Date(assessed_date_input).toISOString() : null
            }
        };
    }

    return formData;
}

// Validate form
function validateForm() {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.form-group.error').forEach(el => {
        el.classList.remove('error');
    });

    // Validate required fields
    const requiredFields = [
        'manufacturer_control_no',
        'date_received',
        'patient_initials',
        'patient_country',
        'patient_age',
        'patient_sex'
    ];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            field.closest('.form-group').classList.add('error');
            isValid = false;
        }
    });

    // Validate manufacturer control number pattern
    const controlNo = document.getElementById('manufacturer_control_no');
    if (controlNo.value && !/^[A-Za-z0-9-_]+$/.test(controlNo.value)) {
        controlNo.closest('.form-group').classList.add('error');
        isValid = false;
    }

    // Validate patient initials pattern
    const initials = document.getElementById('patient_initials');
    if (initials.value && !/^[A-Za-z]+$/.test(initials.value)) {
        initials.closest('.form-group').classList.add('error');
        isValid = false;
    }

    // Validate age format
    const age = document.getElementById('patient_age');
    if (age.value && !/^\d+\s+(Years?|Months?|Days?|Hours?)$/i.test(age.value)) {
        age.closest('.form-group').classList.add('error');
        isValid = false;
    }

    // Validate date not in future
    const dateReceived = document.getElementById('date_received');
    if (dateReceived.value && new Date(dateReceived.value) > new Date()) {
        dateReceived.closest('.form-group').classList.add('error');
        isValid = false;
    }

    // Validate at least one adverse reaction
    if (adverseReactionsCount === 0) {
        showToast('최소 1개의 부작용을 입력해야 합니다', 'error');
        isValid = false;
    }

    // Validate at least one suspected drug
    if (suspectedDrugsCount === 0) {
        showToast('최소 1개의 약물을 입력해야 합니다', 'error');
        isValid = false;
    }

    return isValid;
}

// Save as draft (localStorage)
window.saveAsDraft = function() {
    try {
        const formData = collectFormData();
        localStorage.setItem('cioms_form_draft', JSON.stringify(formData));
        showToast('임시 저장되었습니다', 'success');
    } catch (error) {
        console.error('Error saving draft:', error);
        showToast('임시 저장 실패', 'error');
    }
};

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
