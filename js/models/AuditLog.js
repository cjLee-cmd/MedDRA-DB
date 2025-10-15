/**
 * Audit Log Model
 * Tracks all data modifications for compliance and debugging
 */

import db from '../db/database.js';
import { STORES, TEMPLATES } from '../db/schema.js';

/**
 * Log an audit entry
 * @param {object} entry - Audit log entry
 * @returns {Promise<number>} Audit log ID
 */
export async function logAudit(entry) {
    await db.init();

    const auditLog = {
        ...TEMPLATES.audit_log,
        ...entry,
        timestamp: new Date().toISOString()
    };

    try {
        const id = await db.add(STORES.AUDIT_LOGS, auditLog);
        return id;
    } catch (error) {
        console.error('Error logging audit:', error);
        // Don't throw - audit logging should not break main operations
        return null;
    }
}

/**
 * Get audit logs for a specific record
 * @param {string} tableName - Table name
 * @param {number} recordId - Record ID
 * @returns {Promise<Array>}
 */
export async function getAuditLogs(tableName, recordId) {
    await db.init();

    try {
        const allLogs = await db.getAll(STORES.AUDIT_LOGS);
        const filtered = allLogs.filter(log =>
            log.table_name === tableName && log.record_id === recordId
        );

        // Sort by timestamp descending (newest first)
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return filtered;
    } catch (error) {
        console.error('Error getting audit logs:', error);
        throw error;
    }
}

/**
 * Get recent audit logs
 * @param {number} limit - Maximum number of logs
 * @returns {Promise<Array>}
 */
export async function getRecentAuditLogs(limit = 100) {
    await db.init();

    try {
        const logs = await db.getAll(STORES.AUDIT_LOGS);

        // Sort by timestamp descending
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return logs.slice(0, limit);
    } catch (error) {
        console.error('Error getting recent audit logs:', error);
        throw error;
    }
}

/**
 * Clear old audit logs (data retention)
 * @param {number} daysToKeep - Keep logs newer than this many days
 * @returns {Promise<number>} Number of logs deleted
 */
export async function clearOldAuditLogs(daysToKeep = 365) {
    await db.init();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
        const logs = await db.getAll(STORES.AUDIT_LOGS);
        let deletedCount = 0;

        for (const log of logs) {
            if (new Date(log.timestamp) < cutoffDate) {
                await db.delete(STORES.AUDIT_LOGS, log.id);
                deletedCount++;
            }
        }

        console.log(`✓ Cleared ${deletedCount} old audit logs (older than ${daysToKeep} days)`);
        return deletedCount;
    } catch (error) {
        console.error('Error clearing old audit logs:', error);
        throw error;
    }
}

export default {
    logAudit,
    getAuditLogs,
    getRecentAuditLogs,
    clearOldAuditLogs
};
