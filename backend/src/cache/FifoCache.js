const chalk = require('chalk');

/**
 * FIFO (First-In-First-Out) Cache
 * 
 * Evicts the oldest entry based on insertion order.
 * Accessing an existing key does not change its position in the eviction queue.
 */
class FifoCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.queue = []; // Tracks insertion order
    }

    get(key) {
        if (this.cache.has(key)) {
            console.log(chalk.green(`[FIFO HIT]`) + ` Key: ${chalk.cyan(key)}`);
            return this.cache.get(key);
        }
        console.log(chalk.yellow(`[FIFO MISS]`) + ` Key: ${chalk.cyan(key)}`);
        return null;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            // Update value but keep original insertion order
            this.cache.set(key, value);
            console.log(chalk.blue(`[FIFO UPDATE]`) + ` Key: ${chalk.cyan(key)} updated. Order unchanged.`);
            return;
        }

        if (this.cache.size >= this.capacity) {
            // Evict the oldest (first in queue)
            const oldestKey = this.queue.shift();
            this.cache.delete(oldestKey);
            console.log(chalk.red(`[FIFO EVICTION]`) + ` Evicted: ${chalk.cyan(oldestKey)} (Reason: Capacity reached, oldest inserted)`);
        }

        this.cache.set(key, value);
        this.queue.push(key);
        console.log(chalk.magenta(`[FIFO INSERT]`) + ` Key: ${chalk.cyan(key)} cached.`);
    }
}

module.exports = FifoCache;
