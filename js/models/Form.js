/**
 * CIOMS-I Form Model
 * High-level data access for complete forms with related data
 */

import db from '../db/database.js';
import { STORES, TEMPLATES } from '../db/schema.js';
import { logAudit } from './AuditLog.js';

export class Form {
    /**
     * Check if form with manufacturer control number exists
     * @param {string} controlNo - Manufacturer control number
     * @returns {Promise<object|null>} Existing form or null
     */
    static async getByControlNo(controlNo) {
        await db.init();

        try {
            const forms = await db.getByIndex(STORES.FORMS, 'manufacturer_control_no', controlNo);
            return forms.length > 0 ? forms[0] : null;
        } catch (error) {
            console.error('Error checking control number:', error);
            return null;
        }
    }

    /**
     * Create a new CIOMS-I form with all related data
     * @param {object} formData - Complete form data
     * @returns {Promise<number>} Form ID
     */
    static async create(formData) {
        await db.init();

        try {
            // Check for duplicate manufacturer_control_no
            if (formData.manufacturer_control_no) {
                const existing = await this.getByControlNo(formData.manufacturer_control_no);
                if (existing) {
                    throw new Error(`폼이 이미 존재합니다: 관리번호 "${formData.manufacturer_control_no}" (ID: ${existing.id})`);
                }
            }

            // 1. Create main form record
            const form = {
                manufacturer_control_no: formData.manufacturer_control_no,
                date_received: formData.date_received,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const formId = await db.add(STORES.FORMS, form);

            // 2. Create patient info (1:1)
            if (formData.patient_info) {
                const patientInfo = {
                    form_id: formId,
                    ...formData.patient_info
                };
                await db.add(STORES.PATIENT_INFO, patientInfo);
            }

            // 3. Create adverse reactions (1:N)
            if (formData.adverse_reactions && formData.adverse_reactions.length > 0) {
                for (let i = 0; i < formData.adverse_reactions.length; i++) {
                    const reaction = {
                        form_id: formId,
                        sequence_no: i + 1,
                        created_at: new Date().toISOString(),
                        ...formData.adverse_reactions[i]
                    };
                    await db.add(STORES.ADVERSE_REACTIONS, reaction);
                }
            }

            // 4. Create suspected drugs (1:N)
            if (formData.suspected_drugs && formData.suspected_drugs.length > 0) {
                for (let i = 0; i < formData.suspected_drugs.length; i++) {
                    const drug = {
                        form_id: formId,
                        sequence_no: i + 1,
                        created_at: new Date().toISOString(),
                        ...formData.suspected_drugs[i]
                    };
                    await db.add(STORES.SUSPECTED_DRUGS, drug);
                }
            }

            // 5. Create lab results (1:N)
            if (formData.lab_results && formData.lab_results.length > 0) {
                for (let i = 0; i < formData.lab_results.length; i++) {
                    const labResult = {
                        form_id: formId,
                        sequence_no: i + 1,
                        created_at: new Date().toISOString(),
                        ...formData.lab_results[i]
                    };
                    await db.add(STORES.LAB_RESULTS, labResult);
                }
            }

            // 6. Create causality assessment (1:1)
            if (formData.causality_assessment) {
                const causality = {
                    form_id: formId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    ...formData.causality_assessment
                };
                await db.add(STORES.CAUSALITY_ASSESSMENT, causality);
            }

            // 7. Log audit trail
            await logAudit({
                table_name: STORES.FORMS,
                record_id: formId,
                action: 'INSERT',
                new_values: { ...form, id: formId }
            });

            console.log(`✓ Form created successfully (ID: ${formId})`);
            return formId;

        } catch (error) {
            console.error('Error creating form:', error);
            throw error;
        }
    }

    /**
     * Get complete form with all related data
     * @param {number} formId - Form ID
     * @returns {Promise<object|null>}
     */
    static async getById(formId) {
        await db.init();

        try {
            // 1. Get main form
            const form = await db.get(STORES.FORMS, formId);
            if (!form) {
                return null;
            }

            // 2. Get patient info
            const patientRecords = await db.getByIndex(STORES.PATIENT_INFO, 'form_id', formId);
            form.patient_info = patientRecords[0] || null;

            // 3. Get adverse reactions
            form.adverse_reactions = await db.getByIndex(STORES.ADVERSE_REACTIONS, 'form_id', formId);
            form.adverse_reactions.sort((a, b) => a.sequence_no - b.sequence_no);

            // 4. Get suspected drugs
            form.suspected_drugs = await db.getByIndex(STORES.SUSPECTED_DRUGS, 'form_id', formId);
            form.suspected_drugs.sort((a, b) => a.sequence_no - b.sequence_no);

            // 5. Get lab results
            form.lab_results = await db.getByIndex(STORES.LAB_RESULTS, 'form_id', formId);
            form.lab_results.sort((a, b) => a.sequence_no - b.sequence_no);

            // 6. Get causality assessment
            const causalityRecords = await db.getByIndex(STORES.CAUSALITY_ASSESSMENT, 'form_id', formId);
            form.causality_assessment = causalityRecords[0] || null;

            return form;

        } catch (error) {
            console.error('Error getting form:', error);
            throw error;
        }
    }

    /**
     * Get all forms (without related data for performance)
     * @param {object} options - Query options
     * @returns {Promise<Array>}
     */
    static async getAll(options = {}) {
        await db.init();

        const {
            limit = 50,
            offset = 0,
            sortBy = 'date_received',
            sortOrder = 'desc'
        } = options;

        try {
            let forms = await db.getAll(STORES.FORMS);

            // Sort
            forms.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                if (sortOrder === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });

            // Pagination
            const paginatedForms = forms.slice(offset, offset + limit);

            return {
                forms: paginatedForms,
                total: forms.length,
                offset: offset,
                limit: limit
            };

        } catch (error) {
            console.error('Error getting all forms:', error);
            throw error;
        }
    }

    /**
     * Search forms by criteria
     * @param {object} criteria - Search criteria
     * @returns {Promise<Array>}
     */
    static async search(criteria) {
        await db.init();

        const {
            control_no,
            patient_initials,
            country,
            date_from,
            date_to,
            reaction,
            drug,
            limit = 50
        } = criteria;

        try {
            const results = await db.search(STORES.FORMS, (form) => {
                // Filter by control number
                if (control_no && !form.manufacturer_control_no.toLowerCase().includes(control_no.toLowerCase())) {
                    return false;
                }

                // Filter by date range
                if (date_from && new Date(form.date_received) < new Date(date_from)) {
                    return false;
                }
                if (date_to && new Date(form.date_received) > new Date(date_to)) {
                    return false;
                }

                return true;
            }, limit);

            // Additional filtering for related data (requires joins)
            const filteredResults = [];

            for (const form of results) {
                let match = true;

                // Filter by patient initials/country
                if (patient_initials || country) {
                    const patients = await db.getByIndex(STORES.PATIENT_INFO, 'form_id', form.id);
                    if (patients.length === 0) {
                        match = false;
                    } else {
                        const patient = patients[0];
                        if (patient_initials && !patient.initials.toLowerCase().includes(patient_initials.toLowerCase())) {
                            match = false;
                        }
                        if (country && !patient.country.toLowerCase().includes(country.toLowerCase())) {
                            match = false;
                        }
                    }
                }

                // Filter by reaction
                if (match && reaction) {
                    const reactions = await db.getByIndex(STORES.ADVERSE_REACTIONS, 'form_id', form.id);
                    const hasReaction = reactions.some(r =>
                        r.reaction_en.toLowerCase().includes(reaction.toLowerCase()) ||
                        (r.reaction_ko && r.reaction_ko.includes(reaction))
                    );
                    if (!hasReaction) {
                        match = false;
                    }
                }

                // Filter by drug
                if (match && drug) {
                    const drugs = await db.getByIndex(STORES.SUSPECTED_DRUGS, 'form_id', form.id);
                    const hasDrug = drugs.some(d =>
                        d.drug_name_en.toLowerCase().includes(drug.toLowerCase()) ||
                        (d.drug_name_ko && d.drug_name_ko.includes(drug))
                    );
                    if (!hasDrug) {
                        match = false;
                    }
                }

                if (match) {
                    filteredResults.push(form);
                }

                if (filteredResults.length >= limit) {
                    break;
                }
            }

            return filteredResults;

        } catch (error) {
            console.error('Error searching forms:', error);
            throw error;
        }
    }

    /**
     * Update form with related data
     * @param {number} formId - Form ID
     * @param {object} formData - Updated form data
     * @returns {Promise<void>}
     */
    static async update(formId, formData) {
        await db.init();

        try {
            // 1. Get old values for audit
            const oldForm = await this.getById(formId);

            // 2. Update main form
            const updatedForm = {
                ...oldForm,
                ...formData,
                id: formId,
                updated_at: new Date().toISOString()
            };
            await db.update(STORES.FORMS, updatedForm);

            // 3. Update patient info
            if (formData.patient_info) {
                const existingPatient = await db.getByIndex(STORES.PATIENT_INFO, 'form_id', formId);
                if (existingPatient.length > 0) {
                    const updated = { ...existingPatient[0], ...formData.patient_info };
                    await db.update(STORES.PATIENT_INFO, updated);
                } else {
                    const newPatient = { form_id: formId, ...formData.patient_info };
                    await db.add(STORES.PATIENT_INFO, newPatient);
                }
            }

            // Note: For simplicity, reactions/drugs/labs updates would require
            // deleting all and re-creating. For production, implement proper
            // diff and update logic.

            // 4. Log audit trail
            await logAudit({
                table_name: STORES.FORMS,
                record_id: formId,
                action: 'UPDATE',
                old_values: oldForm,
                new_values: updatedForm
            });

            console.log(`✓ Form updated successfully (ID: ${formId})`);

        } catch (error) {
            console.error('Error updating form:', error);
            throw error;
        }
    }

    /**
     * Delete form and all related data (CASCADE)
     * @param {number} formId - Form ID
     * @returns {Promise<void>}
     */
    static async delete(formId) {
        await db.init();

        try {
            // 1. Get form for audit log
            const form = await db.get(STORES.FORMS, formId);

            // 2. Delete related records (CASCADE behavior)
            await db.deleteByIndex(STORES.PATIENT_INFO, 'form_id', formId);
            await db.deleteByIndex(STORES.ADVERSE_REACTIONS, 'form_id', formId);
            await db.deleteByIndex(STORES.SUSPECTED_DRUGS, 'form_id', formId);
            await db.deleteByIndex(STORES.LAB_RESULTS, 'form_id', formId);
            await db.deleteByIndex(STORES.CAUSALITY_ASSESSMENT, 'form_id', formId);

            // 3. Delete main form
            await db.delete(STORES.FORMS, formId);

            // 4. Log audit trail
            await logAudit({
                table_name: STORES.FORMS,
                record_id: formId,
                action: 'DELETE',
                old_values: form
            });

            console.log(`✓ Form deleted successfully (ID: ${formId})`);

        } catch (error) {
            console.error('Error deleting form:', error);
            throw error;
        }
    }

    /**
     * Get form count
     * @returns {Promise<number>}
     */
    static async count() {
        await db.init();
        return await db.count(STORES.FORMS);
    }
}

export default Form;
