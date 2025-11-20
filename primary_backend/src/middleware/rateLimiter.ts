import { Request, Response, NextFunction } from "express";
import { ExtendedReq } from "../routes/workflow";
type Bucket = {
  tokens: number;
  lastRefill: number;
};
type RateOptions = {
  tokensPerInterval: number; 
  intervalMs: number; 
  bucketSize?: number; 
  keyExtractor?: (req: ExtendedReq) => string; 
  statusCode?: number; 
  errorMessage?: string;
};
export function createRateLimiter(opts: RateOptions) {
  const {
    tokensPerInterval,
    intervalMs,
    bucketSize = tokensPerInterval,
    keyExtractor = (req: ExtendedReq) => req.ip||"unknown-ip",
    statusCode = 429,
    errorMessage = "Too many requests",
  } = opts;
  const store = new Map<string, Bucket>();
  const refillRatePerMs = tokensPerInterval / intervalMs;
  return function rateLimiterMiddleware(
    req: ExtendedReq,
    res: Response,
    next: NextFunction
  ) {
    try {
      const now = Date.now();
      // extracting the key
      const key = keyExtractor(req);
      let bucket = store.get(key);
      if (!bucket) {
        bucket = { tokens: tokensPerInterval, lastRefill: now };
        store.set(key, bucket);
      }
      //calculating the elapsed time
      const elapsed = now - bucket.lastRefill;
      if(elapsed>0){
    //how many tokens to add
    const tokensToAdd=elapsed*refillRatePerMs;
    bucket.tokens=Math.min(bucketSize,bucket.tokens+tokensToAdd);
    bucket.lastRefill=now
      }
      if(bucket.tokens>=1){
        bucket.tokens-=1;
        res.setHeader("X-RateLimit-Limit", String(bucketSize));
        res.setHeader("X-RateLimit-Remaining", String(Math.floor(bucket.tokens)));
        return next()
      }
      //calculating time required to refill one token
      const msNeeded=(1-bucket.tokens)*refillRatePerMs
      const retryAfterSec = Math.ceil(msNeeded / 1000);

      res.setHeader("Retry-After", String(retryAfterSec));
      res.setHeader("X-RateLimit-Limit", String(bucketSize));
      res.setHeader("X-RateLimit-Remaining", "0");

      return res.status(statusCode).json({
        error: errorMessage,
        retry_after_seconds: retryAfterSec,
      });
    } catch (error) {
        //incase of limiter failure we do not block the traffic 
        return next()
    }
  };
}

// now creating a global limiter which would be 
export const globalLimiter = createRateLimiter({ tokensPerInterval: 100, intervalMs:60_000, bucketSize:200 });

export const userLimiter = createRateLimiter({
  tokensPerInterval: 20, intervalMs: 60000, bucketSize: 10,
  keyExtractor: (req) => `user:${req.userId ?? req.ip}`
});


export const workflowLimiter = createRateLimiter({
  tokensPerInterval: 30, intervalMs: 60000, bucketSize: 30,
  keyExtractor: (req) => `user:${req.userId ?? req.ip}`
});


export const webhookLimiter = createRateLimiter({
  tokensPerInterval: 60, intervalMs: 60_000, bucketSize: 60,
  keyExtractor: (req) => `webhook:${String(req.params.path  ?? req.ip)}`
});

export const credLimiter = createRateLimiter({
  tokensPerInterval: 20, intervalMs: 60_000, bucketSize: 10,
  keyExtractor: (req) => `cred:${req.userId ?? req.ip}`
});

export const nodeExecLimiter = createRateLimiter({
  tokensPerInterval: 60, intervalMs: 60_000, bucketSize: 80,
  keyExtractor: (req) => `user:${req.userId ?? req.ip}`
});
