// Redis ke EVAL method ko ioredis ya Lua-support wale client ke saath use karte hain.
export interface RedisEvalClient { // Client ka chhota sa contract yahan define hota hai.
  eval( // Redis mein Lua script chalane ke liye eval method hai.
    script: string, // Lua script ka text pehla argument hota hai.
    numberOfKeys: number, // Script ko diye ja rahe Redis keys ki sankhya hoti hai.
    ...args: Array<string | number> // Keys ke baad script ke ARGV values aate hain.
  ): Promise<unknown>; // Redis ka raw jawab async milta hai.
} // Client interface yahan khatam hota hai.
// Request allow hone aur rate-limit metadata ka result shape yeh hai.
export interface IpRateLimitResult { // Caller ko milne wale result ke fields yahan hain.
  allowed: boolean; // Request ko allow kiya gaya hai ya nahi.
  remaining: number; // Window mein kitne requests aur allowed hain.
  retryAfterMs: number; // Dobara try karne tak kitne milliseconds rukna hai.
} // Result interface yahan khatam hota hai.
// Har IP ke timestamps sorted set mein rehte hain aur Lua operation atomic banata hai.
export const slidingWindowScript = /* Redis par execute hone wali Lua script yahan shuru hoti hai. */ `
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
`; // Lua script yahan khatam hoti hai.
// Ek IP ke liye Redis ke sliding-window rate limiter ko check karta hai.
export async function checkIpRateLimit( // Rate-limit check karne wala async function hai.
  redis: RedisEvalClient, // Redis client ko argument mein lete hain.
  ip: string, // Jis IP ke requests count karne hain woh lete hain.
  limit: number, // Window mein allowed requests ki maximum sankhya lete hain.
  windowMs: number, // Rate-limit window ko milliseconds mein lete hain.
): Promise<IpRateLimitResult> { // Function typed result async return karta hai.
  const key = `rate-limit:${encodeURIComponent(ip)}`; // IP se Redis key banate aur encode karte hain.
  const result = (await redis.eval( // Redis mein atomic Lua script chala kar result lete hain.
    slidingWindowScript, // Lua script ko execute karte hain.
    2, // Script pehle do arguments ko Redis keys samajhti hai.
    key, // Pehli key requests ke timestamps rakhti hai.
    `${key}:sequence`, // Doosri key unique request IDs banati hai.
    Date.now(), // Abhi ka timestamp ARGV[1] ke roop mein dete hain.
    windowMs, // Window duration ARGV[2] ke roop mein dete hain.
    limit, // Request limit ARGV[3] ke roop mein dete hain.
  )) as [number, number, number]; // Lua ka jawaab allowed, count, retry tuple maana jata hai.
  const [allowed, count, retryAfterMs] = result; // Tuple ke teen values ko alag naam dete hain.
  return { // Caller ke liye readable object banate hain.
    allowed: allowed === 1, // Lua ka 1 boolean true mein badalte hain.
    remaining: limit - count, // Limit mein se current count ghata kar bachi requests nikalte hain.
    retryAfterMs, // Lua se mila retry duration seedha caller ko dete hain.
  }; // Result object yahan khatam hota hai.
} // Function yahan khatam hota hai.
