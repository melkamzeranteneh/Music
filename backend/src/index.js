import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import { createClient } from 'redis';
import rateLimiterLib from 'redis-rate-limiter';
import path from 'path';
import FifoCache from './cache/FifoCache.js';
import LruCache from './cache/LruCache.js';
import LfuCache from './cache/LfuCache.js';
import JsonDatabase from './db/JsonDatabase.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// JSON Database Initialization
const db = new JsonDatabase(path.join(__dirname, 'db', 'music_db.json'));
async function initDb() {
    try {
        await db.init();
        const music = await db.find('music');
        console.log(`[SYSTEM] Database initialized. Music count: ${music ? music.length : 0}`);
    } catch (err) {
        console.error('[SYSTEM] Database initialization failed:', err);
    }
}
initDb();

// Inline Redis Rate Limiter (fixed window 15/min)
let redisAvailable = false;
let errorLogged = false;
const RATE_LIMIT_MAX = 15;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = createClient({
    url: REDIS_URL,
    legacyMode: true,
    disableOfflineQueue: true,
    socket: {
        reconnectStrategy: () => new Error('Redis reconnect disabled (rate limiting degraded)')
    }
});

let limitFn = null;

redisClient.on('error', () => {
    if (!errorLogged) {
        console.warn('[RATE LIMIT] Redis connection error. Running without rate limiting.');
        errorLogged = true;
    }
    redisAvailable = false;
});

async function initRateLimiter() {
    try {
        await redisClient.connect();
        limitFn = rateLimiterLib.create({
            redis: redisClient,
            key: (req) => req.headers['x-user-id'] || 'default-user',
            rate: `${RATE_LIMIT_MAX}/minute`
        });
        redisAvailable = true;
        console.log('Connected to Redis for rate limiting.');
    } catch (err) {
        if (!errorLogged) {
            console.warn('WARNING: Could not connect to Redis. Running without rate limiting.');
            errorLogged = true;
        }
        redisAvailable = false;
        // Continue in degraded mode
    }
}
initRateLimiter();

const rateLimiter = (req, res, next) => {
    if (!redisAvailable || !limitFn) return next();
    try {
        limitFn(req, (err, rate) => {
            if (err) {
                console.warn('[RATE LIMIT] Not available; proceeding without limit.');
                return next();
            }
            if (rate && rate.over) {
                return res.status(429).json({ error: `Too many requests. Limit: ${RATE_LIMIT_MAX}/min` });
            }
            next();
        });
    } catch {
        console.warn('[RATE LIMIT] Error during limiting; proceeding without limit.');
        next();
    }
};

// Cache Config
const CAPACITY = 5;
const caches = {
    FIFO: new FifoCache(CAPACITY),
    LRU: new LruCache(CAPACITY),
    LFU: new LfuCache(CAPACITY)
};
let currentPolicy = 'LRU';

// Rate Limiter Middleware
// `rateLimiter` is defined above

// Endpoints
app.get('/music', async (req, res) => {
    const music = await db.find('music');
    res.json(music);
});

app.get('/policy', (req, res) => res.json({ policy: currentPolicy }));

app.post('/policy', (req, res) => {
    const { policy } = req.body;
    if (caches[policy]) {
        currentPolicy = policy;
        console.log(`[SYSTEM] Switched cache policy to: ${policy}`);
        return res.json({ success: true, policy });
    }
    res.status(400).json({ error: 'Invalid policy' });
});

app.post('/play/:trackId', rateLimiter, async (req, res) => {
    const { trackId } = req.params;
    const { artist, track, genre } = req.body;
    const key = trackId; // Use trackId from URL as the cache key
    const selectedCache = caches[currentPolicy];

    // Prepare a standard payload for caches on miss
    const musicData = { artist, track, genre, timestamp: Date.now() };

    // First, treat this play as an access event across all caches
    Object.entries(caches).forEach(([name, c]) => {
        const existing = c.get(key);
        if (!existing) {
            c.put(key, musicData);
        }
    });

    // Determine hit/miss for the currently selected cache
    const selectedHit = selectedCache.get(key);
    if (selectedHit) {
        return res.json({ status: 'HIT', data: selectedHit, latency: 0 });
    }

    // Simulate processing latency for selected cache miss
    const delay = Math.floor(Math.random() * 401) + 800; // 800ms - 1200ms
    await new Promise(resolve => setTimeout(resolve, delay));

    selectedCache.put(key, musicData);
    res.json({ status: 'MISS', data: musicData, latency: delay });
});

app.get('/cache/state', (req, res) => {
    const cache = caches[currentPolicy];
    let content = [];
    let orderLabel = '';

    if (cache.cache instanceof Map) { // For LRU and FIFO
        const values = Array.from(cache.cache.values());
        if (currentPolicy === 'LRU') {
            // Map iterates oldest -> newest; show most recent first
            content = values.slice().reverse();
            orderLabel = 'Most Recent → ... → Least Recent';
        } else {
            // FIFO insertion order: first in -> last in
            content = values;
            orderLabel = 'First In → ... → Last In';
        }
    } else if (cache.values instanceof Map) { // For LFU
        // Sort by frequency desc; ties keep insertion order via lists Set
        const keys = Array.from(cache.values.keys());
        keys.sort((a, b) => (cache.counts.get(b) || 0) - (cache.counts.get(a) || 0));
        content = keys.map(k => cache.values.get(k));
        orderLabel = 'Highest Freq → ... → Lowest Freq';
    }

    res.json({
        policy: currentPolicy,
        capacity: cache.capacity,
        size: content.length,
        orderLabel,
        content
    });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
const server = app.listen(PORT, () => {
    console.log(`============================================`);
    console.log(`   Music Cache Backend Running on :${PORT}`);
    console.log(`   Policy: ${currentPolicy}`);
    console.log(`============================================`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is in use. Set a different PORT env var, e.g., 3003.`);
        console.error(`Example: set PORT then restart:`);
        console.error(`  PowerShell: $env:PORT = "3003"; npm start`);
        process.exit(1);
    }
    throw err;
});
