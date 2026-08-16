interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter
 * @param key Unique identifier (e.g., IP address or email)
 * @param maxHits Maximum allowed requests
 * @param windowMs Window duration in milliseconds (default: 15 minutes)
 * @returns boolean True if request is allowed, false if limit exceeded
 */
export function checkRateLimit(key: string, maxHits = 5, windowMs = 15 * 60 * 1000): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (record.count >= maxHits) {
    return { allowed: false, retryAfterMs: Math.max(0, record.resetTime - now) };
  }

  record.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}
