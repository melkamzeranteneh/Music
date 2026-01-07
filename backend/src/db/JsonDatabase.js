import fs from 'fs/promises';
import path from 'path';

/**
 * JsonDatabase
 * A simple collection-based database stored in a JSON file.
 */
class JsonDatabase {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = {};
        this.initialized = false;
    }

    /**
     * Initialize the database by loading from disk or creating a new file.
     */
    async init() {
        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            this.data = JSON.parse(content) || {};
            if (typeof this.data !== 'object') this.data = {};
            console.log(`[DB] Database loaded from ${this.filePath}`);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`[DB] No data file found, initializing empty DB.`);
                this.data = {};
                await this._save();
            } else {
                console.error(`[DB] Failed to load database: ${err.message}`);
                this.data = {};
            }
        }
        this.initialized = true;
    }

    /**
     * Save the current state to the JSON file atomically.
     */
    async _save() {
        const tempPath = `${this.filePath}.tmp`;
        const content = JSON.stringify(this.data, null, 2);

        // Atomic write: write to tmp then rename
        await fs.writeFile(tempPath, content, 'utf-8');
        await fs.rename(tempPath, this.filePath);
    }

    /**
     * Get a collection.
     */
    getCollection(name) {
        if (!this.data[name]) {
            this.data[name] = [];
        }
        return this.data[name];
    }

    /**
     * Insert a record into a collection.
     */
    async insert(collectionName, record) {
        if (!this.initialized) await this.init();

        const collection = this.getCollection(collectionName);
        const newRecord = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            ...record,
            createdAt: new Date().toISOString()
        };

        collection.push(newRecord);
        await this._save();
        console.log(`[DB] Inserted into ${collectionName}: ${newRecord.id}`);
        return newRecord;
    }

    /**
     * Find records matching a query.
     */
    async find(collectionName, query = {}) {
        if (!this.initialized) await this.init();
        const collection = this.getCollection(collectionName);

        return collection.filter(item => {
            for (let key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    }

    /**
     * Update records matching a query.
     */
    async update(collectionName, query, updates) {
        if (!this.initialized) await this.init();
        const collection = this.getCollection(collectionName);
        let count = 0;

        this.data[collectionName] = collection.map(item => {
            const match = Object.keys(query).every(key => item[key] === query[key]);
            if (match) {
                count++;
                return { ...item, ...updates, updatedAt: new Date().toISOString() };
            }
            return item;
        });

        if (count > 0) await this._save();
        console.log(`[DB] Updated ${count} records in ${collectionName}`);
        return count;
    }

    /**
     * Delete records matching a query.
     */
    async delete(collectionName, query) {
        if (!this.initialized) await this.init();
        const collection = this.getCollection(collectionName);
        const originalSize = collection.length;

        this.data[collectionName] = collection.filter(item => {
            return !Object.keys(query).every(key => item[key] === query[key]);
        });

        const deletedCount = originalSize - this.data[collectionName].length;
        if (deletedCount > 0) await this._save();
        console.log(`[DB] Deleted ${deletedCount} records from ${collectionName}`);
        return deletedCount;
    }
}

export default JsonDatabase;
