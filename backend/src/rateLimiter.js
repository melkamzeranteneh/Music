import { createClient } from 'redis';
import chalk from 'chalk';

let redisAvailable = false;
let errorLogged = false;
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    disableOfflineQueue: true,
    socket: {
        // Stop repeated reconnect attempts to avoid noisy logs when Redis is down
        reconnectStrategy: () => new Error('Redis reconnect disabled (rate limiting degraded)')
    }
});

redisClient.on('error', (err) => {
    if (!errorLogged) {
        console.warn('[RATE LIMIT] Redis connection error. Running without rate limiting.');
        errorLogged = true;
    }
    redisAvailable = false;
});

export async function initRateLimiter() {
    try {
        await redisClient.connect();
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

export const rateLimiter = async (req, res, next) => {
    if (process.env.RATE_LIMIT_ENABLED === 'false') {
        return next();
    }
    if (!redisAvailable) {
        return next();
    }

    const userId = req.headers['x-user-id'] || 'default-user';
    const minute = new Date().getMinutes();
    const key = `rate:${userId}:${minute}`;

    try {
        const count = await redisClient.incr(key);
        if (count === 1) {
            await redisClient.expire(key, 60);
        }

        if (count > 10) {
            console.log(chalk.red(`[RATE LIMIT] Blocked userId: ${userId} (${count} req/min)`));
            return res.status(429).json({ error: 'Too many requests. Limit: 10/min' });
        }
    } catch (err) {
        console.warn(chalk.yellow('[RATE LIMIT] WARNING: Could not apply rate limit. Is Redis running? Proceeding without rate limit.'));
        // In a real-world scenario, you might want to block the request or handle this differently
    }
    next();
};
