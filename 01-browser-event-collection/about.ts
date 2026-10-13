// # Exercise 1: Build browser event collection
// 
// ## Interviewer 
// 
// “Design and implement a tiny, privacy-conscious analytics tracker. A customer adds one script to their site. The script reports page views and time spent; our server validates and enriches events before handing them to downstream processing. Show me the browser payload, the ingestion contract, and how you handle bad or abusive requests.”
// 
// ## Clarify before coding
// 
// - What is the minimum event shape the server needs?
// - Which fields are supplied by the browser, and which must be derived server-side?
// - What should happen when the API key is missing, malformed, or unknown?
// - How will navigation and page-exit events avoid recording the same visit twice?
// - Which privacy and abuse controls can the collector enforce without blocking legitimate sites?
// 
// ## Contract to implement
// 
// Accept a page-view event with a site API key, visitor identifier, page path, visit timestamp, optional title/referrer/previous path, and browser/device/OS/timezone hints. Normalize it into a server-owned event with the resolved domain ID, normalized path, parsed timestamps, and server-derived location where available. Return a clear success or client-error response; never silently treat a rejected request as a successful event.
// 
// ## Acceptance criteria
// 
// - Validate required values, lengths, date ranges, and allowed exit-event types.
// - Normalize paths consistently and safely parse referrers.
// - Apply rate limits before expensive enrichment or queue work.
// - Do not trust forwarded IP headers unless the proxy configuration is trusted.
// - Document origin-check limitations; an `Origin` header is not authentication.
// - Test malformed JSON, unknown keys, empty paths, invalid dates, and repeated page-exit signals.
// 
// ## Follow-up questions
// 
// - What changes when the collector handles millions of events per hour?
// - How would you prevent one site from forging another site's traffic?
// - Which fields should be discarded or coarsened for privacy?
// 