import chalk from 'chalk';

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
            console.log(`${chalk.bgGreen.black(' HIT ')} [FIFO] Key: ${chalk.cyan(key)}`);
            return this.cache.get(key);
        }
        console.log(`${chalk.bgYellow.black(' MISS ')} [FIFO] Key: ${chalk.cyan(key)}`);
        return null;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.set(key, value);
            console.log(`${chalk.bgBlue.white(' UPDATE ')} [FIFO] Key: ${chalk.cyan(key)} updated. Order unchanged.`);
            return;
        }

        if (this.cache.size >= this.capacity && this.capacity > 0) {
            const oldestKey = this.queue.shift();
            if (oldestKey) {
                this.cache.delete(oldestKey);
                console.log(`${chalk.bgRed.white(' EVICT ')} [FIFO] Key: ${chalk.cyan(oldestKey)} (Reason: Oldest)`);
            }
        }

        this.cache.set(key, value);
        this.queue.push(key);
        console.log(`${chalk.bgMagenta.white(' PUT ')} [FIFO] Key: ${chalk.cyan(key)}`);
    }

    clear() {
        this.cache.clear();
        this.queue = [];
        console.log(chalk.bgRed.white.bold(' CACHE CLEARED ') + ' [FIFO]');
    }
}

export default FifoCache;
