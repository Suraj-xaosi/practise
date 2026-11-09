
export interface RedisEvalClient { 
  eval( 
    script: string, 
    numberOfKeys: number, 
    ...args: Array<string | number> 
  ): Promise<unknown>; 
} 

export interface IpRateLimitResult { 
  allowed: boolean; 
  remaining: number; 
  retryAfterMs: number; 
} 

export const slidingWindowScript =  `
local now = tonumber(ARGV[1]) -- Abhi ka timestamp milliseconds mein lete hain.
local window = tonumber(ARGV[2]) -- Rate-limit window ki lambai lete hain.
local limit = tonumber(ARGV[3]) -- Window ke andar allowed request limit lete hain.

redis.call("ZREMRANGEBYSCORE", KEYS[1], "-inf", now - window) -- Window se purane timestamps hata dete hain.

local count = redis.call("ZCARD", KEYS[1]) -- Abhi window mein bache requests ginte hain.
if count >= limit then -- Limit poori ho to request ko rok dete hain.
  local oldest = redis.call("ZRANGE", KEYS[1], 0, 0, "WITHSCORES") -- Sabse purane request ka timestamp nikalte hain.
  local retryAfter = tonumber(oldest[2]) + window - now -- Purana request expire hone ka samay nikalte hain.
  redis.call("PEXPIRE", KEYS[1], window) -- Request set ke liye expiry lagate hain.
  redis.call("PEXPIRE", KEYS[2], window) -- Sequence key ke liye expiry lagate hain.
  return {0, count, retryAfter} -- Blocked status, count aur retry time lautate hain.
end -- Limit wali condition yahan khatam hoti hai.

local requestId = redis.call("INCR", KEYS[2]) -- Is request ke liye unique ID banate hain.

redis.call("ZADD", KEYS[1], now, requestId) -- Naya request timestamp sorted set mein jodte hain.
redis.call("PEXPIRE", KEYS[1], window) -- Request set ko window ke baad expire karte hain.
redis.call("PEXPIRE", KEYS[2], window) -- Sequence key ko window ke baad expire karte hain.

return {1, count + 1, 0} -- Allowed status, naya count aur zero retry time lautate hain.
`; 

export async function checkIpRateLimit( 
  redis: RedisEvalClient, 
  ip: string, 
  limit: number, 
  windowMs: number, 
): Promise<IpRateLimitResult> { 
  const key = `rate-limit:${encodeURIComponent(ip)}`; 
  const result = (await redis.eval( 
    slidingWindowScript, 
    2, 
    key, 
    `${key}:sequence`, 
    Date.now(), 
    windowMs, 
    limit, 
  )) as [number, number, number]; 
  const [allowed, count, retryAfterMs] = result; 
  return { 
    allowed: allowed === 1, 
    remaining: limit - count, 
    retryAfterMs, 
  }; 
} 
