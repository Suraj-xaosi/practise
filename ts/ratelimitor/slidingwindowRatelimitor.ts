
export interface IpRateLimitResult { 
  allowed: boolean; 
  remaining: number; 
  retryAfterMs: number; 
} 


const requestsByIp = new Map<string, number[]>(); 


export function checkIpRateLimit( 
  ip: string, 
  limit: number, 
  windowMs: number, 
): IpRateLimitResult { 
  const now = Date.now(); 
  const windowStart = now - windowMs; 
  const timestamps = requestsByIp.get(ip) ?? []; 
  const activeTimestamps = timestamps.filter((timestamp) => timestamp > windowStart); 

  if (activeTimestamps.length >= limit) { 
    requestsByIp.set(ip, activeTimestamps); 
    return { 
      allowed: false, 
      remaining: 0, 
      retryAfterMs: activeTimestamps[0] + windowMs - now, 
    }; 
  } 

  activeTimestamps.push(now); 
  requestsByIp.set(ip, activeTimestamps); 
  return { 
    allowed: true, 
    remaining: limit - activeTimestamps.length, 
    retryAfterMs: 0, 
  }; 
} 