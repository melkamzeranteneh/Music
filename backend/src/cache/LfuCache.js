import chalk from 'chalk';

/**
 * LFU (Least Frequently Used) Cache
 * 
 * Evicts the entry with the lowest access frequency.
 * If multiple keys have the same minimum frequency, the oldest one (FIFO) is evicted.
 */
class LfuCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.values = new Map(); // key -> value
        this.counts = new Map(); // key -> frequency
        this.lists = new Map();  // frequency -> Set<key> (Set maintains insertion order)
        this.minFreq = 0;
    }

    _updateFreq(key) {
        const count = this.counts.get(key);
        this.counts.set(key, count + 1);

        // Remove from old frequency list
        this.lists.get(count).delete(key);

        // If the old list is empty and was the minFreq, increment minFreq
        if (count === this.minFreq && this.lists.get(count).size === 0) {
            this.minFreq++;
        }

        // Add to new frequency list
        if (!this.lists.has(count + 1)) {
            this.lists.set(count + 1, new Set());
        }
        this.lists.get(count + 1).add(key);
    }

    get(key) {
        if (!this.values.has(key)) {
            console.log(`${chalk.bgYellow.black(' MISS ')} [LFU] Key: ${chalk.cyan(key)}`);
            return null;
        }

        this._updateFreq(key);
        console.log(`${chalk.bgGreen.black(' HIT ')} [LFU] Key: ${chalk.cyan(key)} (New Freq: ${chalk.bold(this.counts.get(key))})`);
        return this.values.get(key);
    }

    put(key, value) {
        if (this.capacity <= 0) return;

        if (this.values.has(key)) {
            this.values.set(key, value);
            this._updateFreq(key);
            console.log(`${chalk.bgBlue.white(' UPDATE ')} [LFU] Key: ${chalk.cyan(key)} (New Freq: ${chalk.bold(this.counts.get(key))})`);
            return;
        }

        if (this.values.size >= this.capacity) {
            const evictList = this.lists.get(this.minFreq);
            const keyToEvict = evictList.values().next().value;

            evictList.delete(keyToEvict);
            this.values.delete(keyToEvict);
            const freq = this.counts.get(keyToEvict);
            this.counts.delete(keyToEvict);

            console.log(`${chalk.bgRed.white(' EVICT ')} [LFU] Key: ${chalk.cyan(keyToEvict)} (Reason: Freq ${chalk.bold(freq)} was min)`);
        }

        this.values.set(key, value);
        this.counts.set(key, 1);
        this.minFreq = 1;
        if (!this.lists.has(1)) {
            this.lists.set(1, new Set());
        }
        this.lists.get(1).add(key);
        console.log(`${chalk.bgMagenta.white(' PUT ')} [LFU] Key: ${chalk.cyan(key)}`);
    }

    clear() {
        this.values.clear();
        this.counts.clear();
        this.lists.clear();
        this.minFreq = 0;
        console.log(chalk.bgRed.white.bold(' CACHE CLEARED ') + ' [LFU]');
    }
}

export default LfuCache;
