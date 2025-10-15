/**
 * Index Page (Form List and Search)
 * Main page functionality for viewing and searching CIOMS-I forms
 */

import Form from '../models/Form.js';
import { showLoading, showToast, showError, formatDate, escapeHtml } from '../app.js';

// State
let currentPage = 1;
let totalPages = 1;
const perPage = 20;
let currentForms = [];
let currentSearchCriteria = null;

// Initialize page
async function initPage() {
    try {
        // Load initial forms
        await loadForms();

        // Update form count
        await updateFormCount();

        // Setup event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Error initializing page:', error);
        showError('페이지 초기화 실패: ' + error.message);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Clear search
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', handleClearSearch);
    }

    // Show all
    const showAllBtn = document.getElementById('show-all');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => loadForms());
    }

    // Sort
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', handleSort);
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    }
}

// Load forms
async function loadForms(page = 1) {
    showLoading(true);
    hideError();

    try {
        const sortBy = document.getElementById('sort-by')?.value || 'date_received:desc';
        const [field, order] = sortBy.split(':');

        const offset = (page - 1) * perPage;
        const result = await Form.getAll({
            limit: perPage,
            offset: offset,
            sortBy: field,
            sortOrder: order
        });

        currentForms = result.forms;
        currentPage = page;
        totalPages = Math.ceil(result.total / perPage);

        renderForms(currentForms);
        updatePagination();

    } catch (error) {
        console.error('Error loading forms:', error);
        showError('폼 로드 실패: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Handle search
async function handleSearch(event) {
    event.preventDefault();

    const criteria = {
        control_no: document.getElementById('search-control-no')?.value || '',
        patient_initials: document.getElementById('search-patient-initials')?.value || '',
        country: document.getElementById('search-country')?.value || '',
        date_from: document.getElementById('search-date-from')?.value || '',
        date_to: document.getElementById('search-date-to')?.value || '',
        reaction: document.getElementById('search-reaction')?.value || '',
        drug: document.getElementById('search-drug')?.value || '',
        limit: perPage
    };

    // Check if any search criteria provided
    const hasSearch = Object.values(criteria).some(v => v !== '' && v !== perPage);

    if (!hasSearch) {
        showToast('검색 조건을 입력하세요', 'warning');
        return;
    }

    showLoading(true);
    hideError();

    try {
        currentSearchCriteria = criteria;
        const results = await Form.search(criteria);

        currentForms = results;
        currentPage = 1;
        totalPages = 1; // Search results not paginated

        renderForms(currentForms);
        updatePagination();

        showToast(`${results.length}개의 폼을 찾았습니다`, 'success');

    } catch (error) {
        console.error('Error searching forms:', error);
        showError('검색 실패: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Handle clear search
function handleClearSearch() {
    // Clear form inputs
    document.getElementById('search-form')?.reset();

    // Clear search criteria
    currentSearchCriteria = null;

    // Reload all forms
    loadForms(1);

    showToast('검색 조건이 초기화되었습니다', 'success');
}

// Handle sort
async function handleSort() {
    if (currentSearchCriteria) {
        // If searching, re-search with new sort
        await handleSearch({ preventDefault: () => {} });
    } else {
        // Otherwise, reload with new sort
        await loadForms(currentPage);
    }
}

// Render forms table
function renderForms(forms) {
    const tableContainer = document.getElementById('forms-table-container');
    const emptyState = document.getElementById('empty-state');
    const tbody = document.getElementById('forms-tbody');

    if (!forms || forms.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    tbody.innerHTML = forms.map(form => `
        <tr>
            <td data-label="관리번호">
                <strong>${escapeHtml(form.manufacturer_control_no)}</strong>
            </td>
            <td data-label="접수일">${formatDate(form.date_received)}</td>
            <td data-label="환자">-</td>
            <td data-label="국가">-</td>
            <td data-label="부작용 수">-</td>
            <td data-label="약물 수">-</td>
            <td data-label="작업">
                <div class="table-actions">
                    <a href="form-view.html?id=${form.id}" class="btn btn-sm btn-secondary">보기</a>
                    <a href="form-edit.html?id=${form.id}" class="btn btn-sm btn-secondary">수정</a>
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="deleteForm(${form.id}, '${escapeHtml(form.manufacturer_control_no)}')">
                        삭제
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Load patient info for each form (asynchronously)
    forms.forEach(async (form, index) => {
        try {
            const fullForm = await Form.getById(form.id);
            if (fullForm) {
                const row = tbody.children[index];
                if (row) {
                    row.children[2].textContent = fullForm.patient_info?.initials || '-';
                    row.children[3].textContent = fullForm.patient_info?.country || '-';
                    row.children[4].textContent = fullForm.adverse_reactions?.length || 0;
                    row.children[5].textContent = fullForm.suspected_drugs?.length || 0;
                }
            }
        } catch (error) {
            console.error(`Error loading details for form ${form.id}:`, error);
        }
    });
}

// Update pagination
function updatePagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }

    if (pageInfo) {
        pageInfo.textContent = `페이지 ${currentPage} / ${totalPages}`;
    }
}

// Change page
async function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages) {
        return;
    }

    if (currentSearchCriteria) {
        // Cannot paginate search results currently
        showToast('검색 결과는 페이지네이션을 지원하지 않습니다', 'warning');
        return;
    }

    await loadForms(newPage);
}

// Update form count
async function updateFormCount() {
    try {
        const count = await Form.count();
        const countElement = document.getElementById('form-count');
        if (countElement) {
            countElement.textContent = count;
        }
    } catch (error) {
        console.error('Error updating form count:', error);
    }
}

// Delete form
window.deleteForm = async function(formId, controlNo) {
    // Show confirmation modal
    const modal = document.getElementById('delete-modal');
    const confirmBtn = document.getElementById('confirm-delete');
    const controlNoSpan = document.getElementById('delete-form-control-no');

    if (modal && confirmBtn && controlNoSpan) {
        controlNoSpan.textContent = controlNo;
        modal.style.display = 'flex';

        // Setup confirm handler (once)
        confirmBtn.onclick = async () => {
            try {
                showLoading(true);
                await Form.delete(formId);

                closeDeleteModal();
                showToast('폼이 삭제되었습니다', 'success');

                // Reload forms
                await loadForms(currentPage);
                await updateFormCount();

            } catch (error) {
                console.error('Error deleting form:', error);
                showError('폼 삭제 실패: ' + error.message);
            } finally {
                showLoading(false);
            }
        };
    }
};

// Close delete modal
window.closeDeleteModal = function() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Hide error
function hideError() {
    const errorElement = document.getElementById('error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
