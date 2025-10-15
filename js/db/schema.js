/**
 * IndexedDB Schema Definition
 * CIOMS-I Form Management System
 *
 * Database: CiomsFormDB
 * Version: 1
 */

export const DB_NAME = 'CiomsFormDB';
export const DB_VERSION = 1;

/**
 * Object Store (Table) Definitions
 */
export const STORES = {
    FORMS: 'forms',
    PATIENT_INFO: 'patient_info',
    ADVERSE_REACTIONS: 'adverse_reactions',
    SUSPECTED_DRUGS: 'suspected_drugs',
    LAB_RESULTS: 'lab_results',
    CAUSALITY_ASSESSMENT: 'causality_assessment',
    AUDIT_LOGS: 'audit_logs'
};

/**
 * Initialize database schema
 * Creates object stores and indexes
 *
 * @param {IDBDatabase} db - IndexedDB database instance
 */
export function initializeSchema(db) {
    // 1. forms - Main CIOMS-I report table
    if (!db.objectStoreNames.contains(STORES.FORMS)) {
        const formsStore = db.createObjectStore(STORES.FORMS, {
            keyPath: 'id',
            autoIncrement: true
        });

        // Indexes for efficient querying
        formsStore.createIndex('manufacturer_control_no', 'manufacturer_control_no', { unique: true });
        formsStore.createIndex('date_received', 'date_received', { unique: false });
        formsStore.createIndex('created_at', 'created_at', { unique: false });

        console.log('✓ Created object store: forms');
    }

    // 2. patient_info - Patient demographics (1:1 with forms)
    if (!db.objectStoreNames.contains(STORES.PATIENT_INFO)) {
        const patientStore = db.createObjectStore(STORES.PATIENT_INFO, {
            keyPath: 'id',
            autoIncrement: true
        });

        patientStore.createIndex('form_id', 'form_id', { unique: true });
        patientStore.createIndex('country', 'country', { unique: false });
        patientStore.createIndex('initials', 'initials', { unique: false });

        console.log('✓ Created object store: patient_info');
    }

    // 3. adverse_reactions - Adverse reactions (1:N with forms)
    if (!db.objectStoreNames.contains(STORES.ADVERSE_REACTIONS)) {
        const reactionsStore = db.createObjectStore(STORES.ADVERSE_REACTIONS, {
            keyPath: 'id',
            autoIncrement: true
        });

        reactionsStore.createIndex('form_id', 'form_id', { unique: false });
        reactionsStore.createIndex('reaction_en', 'reaction_en', { unique: false });
        reactionsStore.createIndex('reaction_ko', 'reaction_ko', { unique: false });
        reactionsStore.createIndex('form_sequence', ['form_id', 'sequence_no'], { unique: true });

        console.log('✓ Created object store: adverse_reactions');
    }

    // 4. suspected_drugs - Suspected and concomitant drugs (1:N with forms)
    if (!db.objectStoreNames.contains(STORES.SUSPECTED_DRUGS)) {
        const drugsStore = db.createObjectStore(STORES.SUSPECTED_DRUGS, {
            keyPath: 'id',
            autoIncrement: true
        });

        drugsStore.createIndex('form_id', 'form_id', { unique: false });
        drugsStore.createIndex('drug_name_en', 'drug_name_en', { unique: false });
        drugsStore.createIndex('drug_name_ko', 'drug_name_ko', { unique: false });
        drugsStore.createIndex('is_suspected', 'is_suspected', { unique: false });
        drugsStore.createIndex('form_drug_sequence', ['form_id', 'is_suspected', 'sequence_no'], { unique: true });

        console.log('✓ Created object store: suspected_drugs');
    }

    // 5. lab_results - Laboratory test results (1:N with forms)
    if (!db.objectStoreNames.contains(STORES.LAB_RESULTS)) {
        const labStore = db.createObjectStore(STORES.LAB_RESULTS, {
            keyPath: 'id',
            autoIncrement: true
        });

        labStore.createIndex('form_id', 'form_id', { unique: false });
        labStore.createIndex('test_name', 'test_name', { unique: false });
        labStore.createIndex('date_performed', 'date_performed', { unique: false });
        labStore.createIndex('form_lab_sequence', ['form_id', 'sequence_no'], { unique: true });

        console.log('✓ Created object store: lab_results');
    }

    // 6. causality_assessment - Causality assessment (1:1 with forms)
    if (!db.objectStoreNames.contains(STORES.CAUSALITY_ASSESSMENT)) {
        const causalityStore = db.createObjectStore(STORES.CAUSALITY_ASSESSMENT, {
            keyPath: 'id',
            autoIncrement: true
        });

        causalityStore.createIndex('form_id', 'form_id', { unique: true });

        console.log('✓ Created object store: causality_assessment');
    }

    // 7. audit_logs - Audit trail for all data modifications
    if (!db.objectStoreNames.contains(STORES.AUDIT_LOGS)) {
        const auditStore = db.createObjectStore(STORES.AUDIT_LOGS, {
            keyPath: 'id',
            autoIncrement: true
        });

        auditStore.createIndex('timestamp', 'timestamp', { unique: false });
        auditStore.createIndex('action', 'action', { unique: false });
        auditStore.createIndex('table_name', 'table_name', { unique: false });
        auditStore.createIndex('record_id', 'record_id', { unique: false });

        console.log('✓ Created object store: audit_logs');
    }
}

/**
 * Default data structure templates
 */
export const TEMPLATES = {
    form: {
        id: null,  // Auto-generated
        manufacturer_control_no: '',
        date_received: null,  // Date object
        created_at: null,  // Auto-generated timestamp
        updated_at: null   // Auto-generated timestamp
    },

    patient_info: {
        id: null,
        form_id: null,
        initials: '',
        country: '',
        age: '',  // e.g., "62 Years", "6 Months"
        sex: 'Unknown'  // 'M', 'F', 'Unknown'
    },

    adverse_reaction: {
        id: null,
        form_id: null,
        reaction_en: '',
        reaction_ko: '',
        sequence_no: 1,
        created_at: null
    },

    suspected_drug: {
        id: null,
        form_id: null,
        drug_name_en: '',
        drug_name_ko: '',
        indication_en: '',
        indication_ko: '',
        is_suspected: true,  // true: suspected, false: concomitant
        sequence_no: 1,
        created_at: null
    },

    lab_result: {
        id: null,
        form_id: null,
        test_name: '',
        result_value: '',
        unit: '',
        normal_range: '',
        date_performed: null,
        sequence_no: 1,
        created_at: null
    },

    causality_assessment: {
        id: null,
        form_id: null,
        assessment_data: {
            method: '',  // e.g., "WHO-UMC", "Naranjo"
            category: '',  // e.g., "Certain", "Probable", "Possible"
            reason: '',
            assessed_by: '',
            assessed_date: null
        },
        created_at: null,
        updated_at: null
    },

    audit_log: {
        id: null,
        table_name: '',
        record_id: null,
        action: '',  // 'INSERT', 'UPDATE', 'DELETE'
        old_values: null,  // Object with previous values
        new_values: null,  // Object with new values
        timestamp: null
    }
};

/**
 * Data validation rules
 */
export const VALIDATION = {
    manufacturer_control_no: {
        required: true,
        maxLength: 100,
        pattern: /^[A-Za-z0-9-_]+$/,
        message: 'Manufacturer control number must be alphanumeric'
    },

    patient_initials: {
        required: true,
        minLength: 1,
        maxLength: 10,
        pattern: /^[A-Za-z]+$/,
        message: 'Patient initials must be alphabetic (1-10 characters)'
    },

    age_format: {
        pattern: /^\d+\s+(Years?|Months?|Days?|Hours?)$/i,
        message: 'Age format: number + unit (e.g., "62 Years", "6 Months")'
    },

    sex: {
        enum: ['M', 'F', 'Unknown'],
        message: 'Sex must be M, F, or Unknown'
    },

    date_received: {
        required: true,
        maxDate: new Date(),  // Cannot be in future
        message: 'Date received cannot be in the future'
    }
};
