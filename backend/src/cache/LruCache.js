import chalk from 'chalk';

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
            console.log(`${chalk.bgYellow.black(' MISS ')} [LRU] Key: ${chalk.cyan(key)}`);
            return null;
        }

        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);

        console.log(`${chalk.bgGreen.black(' HIT ')} [LRU] Key: ${chalk.cyan(key)} (Recency updated)`);
        return value;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity && this.capacity > 0) {
            const lruKey = this.cache.keys().next().value;
            this.cache.delete(lruKey);
            console.log(`${chalk.bgRed.white(' EVICT ')} [LRU] Key: ${chalk.cyan(lruKey)} (Reason: Least Recently Used)`);
        }

        this.cache.set(key, value);
        console.log(`${chalk.bgMagenta.white(' PUT ')} [LRU] Key: ${chalk.cyan(key)}`);
    }

    clear() {
        this.cache.clear();
        console.log(chalk.bgRed.white.bold(' CACHE CLEARED ') + ' [LRU]');
    }
}

export default LruCache;
