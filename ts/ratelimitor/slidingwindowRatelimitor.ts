// Har IP ke rate-limit check ka result is shape mein milega.
export interface IpRateLimitResult { // Result ka TypeScript contract yahan define hai.
  allowed: boolean; // Request allow hui hai ya block hui hai.
  remaining: number; // Current window mein kitni requests baaki hain.
  retryAfterMs: number; // Block hone par kitni der baad retry karna hai.
} // Result interface yahan khatam hota hai.

// Har IP ke liye uske active request timestamps memory mein rakhte hain.
const requestsByIp = new Map<string, number[]>(); // Map ki key IP hai aur value timestamps ki list hai.

// Diye gaye IP ke liye sliding-window rate limit check karta hai.
export function checkIpRateLimit( // Function ka naam aur export yahan define hai.
  ip: string, // Jis client IP ko check karna hai.
  limit: number, // Window ke andar allowed requests ki maximum sankhya.
  windowMs: number, // Sliding window kitne milliseconds ki hai.
): IpRateLimitResult { // Function ek rate-limit result return karta hai.
  const now = Date.now(); // Abhi ka samay milliseconds mein lete hain.
  const windowStart = now - windowMs; // Window ke shuru hone ka timestamp nikalte hain.
  const timestamps = requestsByIp.get(ip) ?? []; // Is IP ke purane timestamps lete hain.
  const activeTimestamps = timestamps.filter((timestamp) => timestamp > windowStart); // Window se purane requests hata dete hain.

  if (activeTimestamps.length >= limit) { // Limit poori ho to naya request count nahi karte.
    requestsByIp.set(ip, activeTimestamps); // Sirf abhi valid timestamps ko memory mein rakhte hain.
    return { // Blocked request ka result yahan banate hain.
      allowed: false, // Request ko block karte hain.
      remaining: 0, // Limit poori hai isliye aur request baaki nahi.
      retryAfterMs: activeTimestamps[0] + windowMs - now, // Sabse purana request window se nikalne ka samay dete hain.
    }; // Blocked result yahan khatam hota hai.
  } // Limit check yahan khatam hota hai.

  activeTimestamps.push(now); // Allowed request ka timestamp window mein add karte hain.
  requestsByIp.set(ip, activeTimestamps); // Updated timestamps map mein save karte hain.
  return { // Allowed request ka result yahan banate hain.
    allowed: true, // Request ko allow karte hain.
    remaining: limit - activeTimestamps.length, // Current count ghata kar baaki capacity dete hain.
    retryAfterMs: 0, // Allowed request ko retry wait ki zaroorat nahi.
  }; // Allowed result yahan khatam hota hai.
} // Function yahan khatam hota hai.