/**
 * IndexedDB Database Wrapper
 * Provides Promise-based API for CIOMS-I Form Management
 */

import { DB_NAME, DB_VERSION, STORES, initializeSchema } from './schema.js';

class Database {
    constructor() {
        this.db = null;
        this.initPromise = null;
    }

    /**
     * Initialize database connection
     * @returns {Promise<IDBDatabase>}
     */
    async init() {
        if (this.db) {
            return this.db;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Database initialization failed:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✓ Database initialized:', DB_NAME);
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                console.log('Database upgrade needed. Creating schema...');
                const db = event.target.result;
                initializeSchema(db);
                console.log('✓ Schema created successfully');
            };
        });

        return this.initPromise;
    }

    /**
     * Get a transaction
     * @param {string|string[]} storeNames - Store name(s)
     * @param {string} mode - 'readonly' or 'readwrite'
     * @returns {IDBTransaction}
     */
    getTransaction(storeNames, mode = 'readonly') {
        if (!this.db) {
            throw new Error('Database not initialized. Call init() first.');
        }
        return this.db.transaction(storeNames, mode);
    }

    /**
     * Get an object store
     * @param {string} storeName - Store name
     * @param {string} mode - 'readonly' or 'readwrite'
     * @returns {IDBObjectStore}
     */
    getStore(storeName, mode = 'readonly') {
        const transaction = this.getTransaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    /**
     * Add a record
     * @param {string} storeName - Store name
     * @param {object} data - Data to add
     * @returns {Promise<number>} Record ID
     */
    async add(storeName, data) {
        await this.init();

        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get a record by ID
     * @param {string} storeName - Store name
     * @param {number} id - Record ID
     * @returns {Promise<object|undefined>}
     */
    async get(storeName, id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readonly');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all records from a store
     * @param {string} storeName - Store name
     * @returns {Promise<Array>}
     */
    async getAll(storeName) {
        await this.init();

        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readonly');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get records by index
     * @param {string} storeName - Store name
     * @param {string} indexName - Index name
     * @param {any} value - Index value
     * @returns {Promise<Array>}
     */
    async getByIndex(storeName, indexName, value) {
        await this.init();

        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readonly');
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update a record
     * @param {string} storeName - Store name
     * @param {object} data - Data with id property
     * @returns {Promise<number>} Record ID
     */
    async update(storeName, data) {
        await this.init();

        if (!data.id) {
            throw new Error('Record must have an id property');
        }

        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete a record
     * @param {string} storeName - Store name
     * @param {number} id - Record ID
     * @returns {Promise<void>}
     */
    async delete(storeName, id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete all records by index value
     * @param {string} storeName - Store name
     * @param {string} indexName - Index name
     * @param {any} value - Index value
     * @returns {Promise<number>} Number of records deleted
     */
    async deleteByIndex(storeName, indexName, value) {
        await this.init();

        const records = await this.getByIndex(storeName, indexName, value);

        for (const record of records) {
            await this.delete(storeName, record.id);
        }

        return records.length;
    }

    /**
     * Count records in a store
     * @param {string} storeName - Store name
     * @returns {Promise<number>}
     */
    async count(storeName) {
        await this.init();

        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readonly');
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all records from a store
     * @param {string} storeName - Store name
     * @returns {Promise<void>}
     */
    async clear(storeName) {
        await this.init();

        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear entire database
     * @returns {Promise<void>}
     */
    async clearAll() {
        await this.init();

        const storeNames = Object.values(STORES);
        for (const storeName of storeNames) {
            await this.clear(storeName);
        }
        console.log('✓ All data cleared from database');
    }

    /**
     * Search records with cursor
     * @param {string} storeName - Store name
     * @param {Function} filterFn - Filter function (record) => boolean
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>}
     */
    async search(storeName, filterFn, limit = Infinity) {
        await this.init();

        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readonly');
            const request = store.openCursor();
            const results = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;

                if (cursor && results.length < limit) {
                    const record = cursor.value;
                    if (filterFn(record)) {
                        results.push(record);
                    }
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Export all data as JSON
     * @returns {Promise<object>}
     */
    async exportData() {
        await this.init();

        const data = {};
        const storeNames = Object.values(STORES);

        for (const storeName of storeNames) {
            data[storeName] = await this.getAll(storeName);
        }

        return {
            version: DB_VERSION,
            exported_at: new Date().toISOString(),
            data: data
        };
    }

    /**
     * Import data from JSON
     * @param {object} importData - Data to import
     * @param {boolean} clearFirst - Clear existing data first
     * @returns {Promise<object>} Import statistics
     */
    async importData(importData, clearFirst = false) {
        await this.init();

        if (clearFirst) {
            await this.clearAll();
        }

        const stats = {
            imported: {},
            errors: []
        };

        for (const [storeName, records] of Object.entries(importData.data)) {
            if (!Object.values(STORES).includes(storeName)) {
                stats.errors.push(`Unknown store: ${storeName}`);
                continue;
            }

            stats.imported[storeName] = 0;

            for (const record of records) {
                try {
                    // Remove id to let IndexedDB auto-generate
                    const { id, ...recordWithoutId } = record;
                    await this.add(storeName, recordWithoutId);
                    stats.imported[storeName]++;
                } catch (error) {
                    stats.errors.push({
                        store: storeName,
                        record: record,
                        error: error.message
                    });
                }
            }
        }

        console.log('✓ Import completed:', stats);
        return stats;
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.initPromise = null;
            console.log('✓ Database connection closed');
        }
    }
}

// Export singleton instance
export const db = new Database();
export default db;
