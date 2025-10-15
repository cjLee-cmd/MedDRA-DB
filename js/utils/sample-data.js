/**
 * Sample Data Generator
 * Creates sample CIOMS-I forms for testing
 */

import Form from '../models/Form.js';
import { showToast } from '../app.js';

/**
 * Generate sample CIOMS-I forms
 * @param {number} count - Number of forms to generate
 * @returns {Promise<Array>} Array of created form IDs
 */
export async function generateSampleForms(count = 3) {
    const formIds = [];
    const errors = [];

    console.log(`Generating ${count} sample forms...`);

    for (let i = 0; i < count; i++) {
        try {
            const formData = createSampleFormData(i + 1);
            const formId = await Form.create(formData);
            formIds.push(formId);
            console.log(`✓ Created sample form ${i + 1}/${count} (ID: ${formId})`);
        } catch (error) {
            console.error(`✗ Failed to create form ${i + 1}:`, error);
            errors.push({ index: i + 1, error: error.message });
        }
    }

    if (errors.length > 0) {
        console.warn('Some forms failed to create:', errors);
    }

    return { formIds, errors };
}

/**
 * Create sample form data
 */
function createSampleFormData(index) {
    const today = new Date();
    const daysAgo = index * 10;
    const dateReceived = new Date(today);
    dateReceived.setDate(dateReceived.getDate() - daysAgo);

    const samples = [
        {
            manufacturer_control_no: '40054',
            date_received: dateReceived.toISOString(),
            patient_info: {
                initials: 'INT',
                country: 'GERMANY',
                age: '62 Years',
                sex: 'M'
            },
            adverse_reactions: [
                { reaction_en: 'PARALYTIC ILEUS', reaction_ko: '마비성 장폐색' },
                { reaction_en: 'HYPOVOLEMIC SHOCK', reaction_ko: '저혈량성 쇼크' },
                { reaction_en: 'ACUTE RENAL FAILURE', reaction_ko: '급성 신부전' }
            ],
            suspected_drugs: [
                {
                    drug_name_en: 'Xeloda [Capecitabine]',
                    drug_name_ko: '젤로다 [카페시타빈]',
                    indication_en: 'RECTAL CANCER',
                    indication_ko: '직장암',
                    is_suspected: true
                },
                {
                    drug_name_en: 'Eloxatin [Oxaliplatin]',
                    drug_name_ko: '엘록사틴 [옥살리플라틴]',
                    indication_en: 'RECTAL CANCER',
                    indication_ko: '직장암',
                    is_suspected: true
                }
            ],
            lab_results: [
                {
                    test_name: 'Creatinine',
                    result_value: '2.5',
                    unit: 'mg/dL',
                    normal_range: '0.7-1.3',
                    date_performed: dateReceived.toISOString()
                },
                {
                    test_name: 'BUN',
                    result_value: '45',
                    unit: 'mg/dL',
                    normal_range: '7-20',
                    date_performed: dateReceived.toISOString()
                }
            ],
            causality_assessment: {
                assessment_data: {
                    method: 'WHO-UMC',
                    category: 'Probable',
                    reason: 'Temporal relationship established, no alternative cause',
                    assessed_by: 'Dr. Smith',
                    assessed_date: dateReceived.toISOString()
                }
            }
        },
        {
            manufacturer_control_no: '40055',
            date_received: dateReceived.toISOString(),
            patient_info: {
                initials: 'KJH',
                country: 'KOREA',
                age: '45 Years',
                sex: 'F'
            },
            adverse_reactions: [
                { reaction_en: 'HEPATOTOXICITY', reaction_ko: '간독성' },
                { reaction_en: 'NAUSEA', reaction_ko: '오심' }
            ],
            suspected_drugs: [
                {
                    drug_name_en: 'Tylenol [Acetaminophen]',
                    drug_name_ko: '타이레놀 [아세트아미노펜]',
                    indication_en: 'PAIN RELIEF',
                    indication_ko: '진통',
                    is_suspected: true
                }
            ],
            lab_results: [
                {
                    test_name: 'ALT',
                    result_value: '250',
                    unit: 'U/L',
                    normal_range: '0-40',
                    date_performed: dateReceived.toISOString()
                },
                {
                    test_name: 'AST',
                    result_value: '180',
                    unit: 'U/L',
                    normal_range: '0-40',
                    date_performed: dateReceived.toISOString()
                }
            ],
            causality_assessment: {
                assessment_data: {
                    method: 'WHO-UMC',
                    category: 'Possible',
                    reason: 'Known adverse reaction, other causes not ruled out',
                    assessed_by: 'Dr. Kim',
                    assessed_date: dateReceived.toISOString()
                }
            }
        },
        {
            manufacturer_control_no: '40056',
            date_received: dateReceived.toISOString(),
            patient_info: {
                initials: 'ABC',
                country: 'USA',
                age: '28 Years',
                sex: 'M'
            },
            adverse_reactions: [
                { reaction_en: 'ANAPHYLAXIS', reaction_ko: '아나필락시스' },
                { reaction_en: 'URTICARIA', reaction_ko: '두드러기' },
                { reaction_en: 'DYSPNEA', reaction_ko: '호흡곤란' }
            ],
            suspected_drugs: [
                {
                    drug_name_en: 'Penicillin',
                    drug_name_ko: '페니실린',
                    indication_en: 'BACTERIAL INFECTION',
                    indication_ko: '세균 감염',
                    is_suspected: true
                }
            ],
            lab_results: [],
            causality_assessment: {
                assessment_data: {
                    method: 'WHO-UMC',
                    category: 'Certain',
                    reason: 'Immediate reaction after administration, positive re-challenge',
                    assessed_by: 'Dr. Johnson',
                    assessed_date: dateReceived.toISOString()
                }
            }
        }
    ];

    // Cycle through sample data
    const sampleIndex = (index - 1) % samples.length;
    const baseData = samples[sampleIndex];

    // Modify control number to be unique
    return {
        ...baseData,
        manufacturer_control_no: `${baseData.manufacturer_control_no}-${index}`
    };
}

/**
 * Clear all data (for testing)
 */
export async function clearAllData() {
    const confirmed = window.confirm(
        '⚠️ 경고: 모든 데이터가 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.\n\n정말로 모든 데이터를 삭제하시겠습니까?'
    );

    if (!confirmed) {
        return { success: false, message: 'Cancelled by user' };
    }

    try {
        const db = (await import('../db/database.js')).default;
        await db.clearAll();
        console.log('✓ All data cleared successfully');
        showToast('모든 데이터가 삭제되었습니다', 'success');
        return { success: true };
    } catch (error) {
        console.error('✗ Failed to clear data:', error);
        showToast('데이터 삭제 실패: ' + error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Make functions available globally for console testing
window.generateSampleForms = generateSampleForms;
window.clearAllData = clearAllData;

export default {
    generateSampleForms,
    clearAllData
};
