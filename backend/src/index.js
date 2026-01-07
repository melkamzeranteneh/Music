const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
const chalk = require('chalk');
const path = require('path');
const FifoCache = require('./cache/FifoCache');
const LruCache = require('./cache/LruCache');
const LfuCache = require('./cache/LfuCache');
const JsonDatabase = require('./db/JsonDatabase');

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

        if (!music || music.length === 0) {
            console.log('[SYSTEM] Migrating music data to JSON database...');
            const originalMusicPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'music.json');
            console.log(`[SYSTEM] Reading from: ${originalMusicPath}`);

            const fs = require('fs').promises;
            const content = await fs.readFile(originalMusicPath, 'utf-8');
            const originalMusic = JSON.parse(content);

            if (Array.isArray(originalMusic)) {
                console.log(`[SYSTEM] Migrating ${originalMusic.length} tracks.`);
                for (const item of originalMusic) {
                    await db.insert('music', item);
                }
                console.log('[SYSTEM] Migration complete.');
            } else {
                console.error('[SYSTEM] Original music data is not an array.');
            }
        }
    } catch (err) {
        console.error('[SYSTEM] Database initialization failed:', err);
    }
}
initDb();

// Redis Client for Rate Limiting
const redisClient = createClient();
redisClient.on('error', (err) => { }); // Silent error for missing redis

let redisAvailable = false;
const memoryRateLimit = new Map(); // Fallback storage

async function initRedis() {
    try {
        await redisClient.connect();
        redisAvailable = true;
        console.log('Connected to Redis');
    } catch (err) {
        console.warn('Redis unavailable. Using in-memory rate limiting fallback.');
    }
}
initRedis();

// Cache Config
const CAPACITY = 10;
const caches = {
    FIFO: new FifoCache(CAPACITY),
    LRU: new LruCache(CAPACITY),
    LFU: new LfuCache(CAPACITY)
};
let currentPolicy = 'LRU';

// Rate Limiter Middleware
const rateLimiter = async (req, res, next) => {
    const userId = req.headers['x-user-id'] || 'default-user';
    const minute = new Date().getMinutes();
    const key = `${userId}:${minute}`;

    let count = 0;
    if (redisAvailable) {
        try {
            count = await redisClient.incr(`rate:${key}`);
            if (count === 1) await redisClient.expire(`rate:${key}`, 60);
        } catch (err) {
            redisAvailable = false;
        }
    }

    if (!redisAvailable) {
        count = (memoryRateLimit.get(key) || 0) + 1;
        memoryRateLimit.set(key, count);
        // Basic cleanup for memory fallback
        setTimeout(() => memoryRateLimit.delete(key), 60000);
    }

    if (count > 10) {
        console.log(`[RATE LIMIT] Blocked userId: ${userId} (${count} req/min)`);
        return res.status(429).json({ error: 'Too many requests. Limit: 10/min' });
    }
    next();
};

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

app.post('/play', rateLimiter, async (req, res) => {
    const { artist, track, genre } = req.body;
    const key = `${artist}|${track}|${genre}`;
    const cache = caches[currentPolicy];

    const hit = cache.get(key);
    if (hit) {
        return res.json({ status: 'HIT', data: hit, latency: 0 });
    }

    const delay = Math.floor(Math.random() * 401) + 800;
    await new Promise(resolve => setTimeout(resolve, delay));

    const musicData = { artist, track, genre, timestamp: Date.now() };
    cache.put(key, musicData);

    res.json({ status: 'MISS', data: musicData, latency: delay });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`============================================`);
    console.log(`   Music Cache Backend Running on :${PORT}`);
    console.log(`   Policy: ${currentPolicy}`);
    console.log(`============================================`);
});
