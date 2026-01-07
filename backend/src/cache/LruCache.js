const chalk = require('chalk');

/**
 * LRU (Least Recently Used) Cache
 * 
 * Evicts the entry that was accessed longest ago.
 * Accessing an existing key (get or put) updates its recency.
 */
class LruCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) {
            console.log(chalk.yellow(`[LRU MISS]`) + ` Key: ${chalk.cyan(key)}`);
            return null;
        }

        // Refresh recency: delete and re-insert
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);

        console.log(chalk.green(`[LRU HIT]`) + ` Key: ${chalk.cyan(key)} (Recency updated)`);
        return value;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            // Update value and refresh recency
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            // Evict least recently used (first key in insertion order)
            const lruKey = this.cache.keys().next().value;
            this.cache.delete(lruKey);
            console.log(chalk.red(`[LRU EVICTION]`) + ` Evicted: ${chalk.cyan(lruKey)} (Reason: Least recently accessed)`);
        }

        this.cache.set(key, value);
        console.log(chalk.magenta(`[LRU INSERT/UPDATE]`) + ` Key: ${chalk.cyan(key)} cached.`);
    }
}

module.exports = LruCache;
