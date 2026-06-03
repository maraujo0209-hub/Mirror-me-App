import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory track store map (IP address -> Request stats)
// Note: When scaling horizontally to multiple servers, migrate this cache storage layer to Redis.
const ipCacheStore = new Map<string, RateLimitRecord>();

// Cleanup routine: Sweep memory footprint every 10 minutes to prevent cache bloated leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipCacheStore.entries()) {
    if (now > record.resetTime) {
      ipCacheStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

/**
 * Enterprise API Rate Limiter Middleware Factory
 * @param windowMs The time frame window duration in milliseconds (e.g., 15 minutes)
 * @param maxRequests Maximum total request hits allowed within the designated window size
 */
export const rateLimiter = (windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Graceful fallback to localhost identity string if request header contextual mapping is hidden
    const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown_client_ip';
    const currentTime = Date.now();

    let clientRecord = ipCacheStore.get(clientIp);

    // Case A: Fresh IP signature entry initialization
    if (!clientRecord) {
      clientRecord = {
        count: 1,
        resetTime: currentTime + windowMs,
      };
      ipCacheStore.set(clientIp, clientRecord);
    } 
    // Case B: Time window expired -> reset the bucket allocations
    else if (currentTime > clientRecord.resetTime) {
      clientRecord.count = 1;
      clientRecord.resetTime = currentTime + windowMs;
    } 
    // Case C: Active tracking window ongoing -> tick execution count
    else {
      clientRecord.count += 1;
    }

    // Calculate time remaining for informative HTTP headers
    const timeRemainingSeconds = Math.max(0, Math.ceil((clientRecord.resetTime - currentTime) / 1000));

    // Inject industry standard telemetry headers into runtime response meta layers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientRecord.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientRecord.resetTime / 1000));

    // Throttling boundary assessment: Block request chain if quota consumption has breached cap rules
    if (clientRecord.count > maxRequests) {
      logger.warn(`Rate limit violation triggered by IP footprint: [${clientIp}] targeting endpoint [${req.originalUrl}]`);
      
      res.setHeader('Retry-After', timeRemainingSeconds);
      res.status(429).json({
        error: 'Too Many Requests',
        message: `API rate ceiling limit exceeded. Please halt operations and retry execution sequence after ${timeRemainingSeconds} seconds.`,
      });
      return;
    }

    next();
  };
};

export default rateLimiter;
