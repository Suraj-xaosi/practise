// # Raw implementation logic
// 
// Use a plain browser script and Node's `http` server. Keep the transport contract and event-normalization function separate so either can be tested without a browser or server.
// 
// 1. Define a versioned event shape. Mark required values (`apiKey`, `visitorId`, `page`, `visitedAt`) separately from optional metadata.
// 2. In the browser script, find configuration from the script element's `data-*` attributes. Never embed a secret server credential in the script.
// 3. Generate and persist a random first-party visitor ID, with a documented expiration/reset policy. Do not use fingerprinting.
// 4. On initial load, capture the current path/title/time and referrer. Keep only the path/query parts your privacy policy permits; avoid sending fragments.
// 5. On same-origin history navigation, close the prior page interval and send its duration, then create the next page-view event. On `pagehide`/`visibilitychange`, use `navigator.sendBeacon` where possible and prevent duplicate exits with a per-page sent flag.
// 6. Send JSON with `fetch` for normal events. Use a small bounded retry policy only for transient failures; never retry validation/authentication failures indefinitely.
// 7. Create an HTTP server and route only the collector path. Reject unsupported methods/content types, oversized bodies, malformed JSON, and unexpected fields.
// 8. Validate the API key's shape, visitor ID, page length, timestamp, optional-value lengths, and exit type. Distinguish “new page view” from “page exit/update” so an exit update is not counted as a second view.
// 9. Resolve the key to a domain using a parameterized database query. Check that the domain is active and that the key is not revoked.
// 10. Apply per-IP and per-key limits using a token bucket or fixed window. Keep the limiter bounded and use a trusted proxy configuration before accepting proxy IP headers.
// 11. Normalize the page path (remove origin, normalize duplicate/trailing slashes, cap length); parse only a hostname from a valid referrer URL. Reject or explicitly discard invalid optional metadata.
// 12. Enrich with server-observed IP and a local GeoIP database if configured. If enrichment is unavailable, represent it as unknown and log the operational failure; do not fail valid collection solely because optional GeoIP is unavailable.
// 13. Create one canonical event object and enqueue it. For this raw pass, use a bounded in-memory queue and be explicit that process restarts can lose events.
// 14. Return a response only after the event is accepted into that queue. Include a request/event ID for tracing, but do not echo sensitive values.
// 15. Test validation and normalization as pure functions, then test HTTP status/body behavior and browser exit deduplication.
// 