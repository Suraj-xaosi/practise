// # Raw implementation logic
// 
// Use explicit state-transition functions, Node crypto, and parameterized SQL transactions. Keep the payment provider behind a boundary.
// 
// 1. Define domain states and transitions: creation, free expiry, paid activation, paid extension, deactivation, deletion. Write a transition table before writing route code.
// 2. On domain creation, normalize and validate the hostname, verify uniqueness, generate a cryptographically random API key, store a one-way hash, and return the raw key once.
// 3. Authenticate each dashboard request from a server session. For every domain read/write, query by both domain ID and authenticated owner ID; do not use a client-provided owner ID.
// 4. For collector access, hash the presented API key and compare/look up by hash. Check revocation and current domain state before accepting events.
// 5. Create a payment order only after verifying ownership and deriving the payable amount from server-side pricing. Persist an order row with `PENDING` status and a snapshot of the price/purpose.
// 6. For webhooks, read the exact raw request bytes. Compute HMAC-SHA256 using the webhook secret and compare signatures using a constant-time comparison after validating their encoding/length.
// 7. Only after signature verification, parse the body and validate provider event type, order ID, payment ID, and amount/currency against the stored order.
// 8. Start a SQL transaction and lock/read the payment row. If it is already resolved, return success without repeating the domain mutation.
// 9. For a captured payment, mark payment successful and inspect the domain's current state inside the transaction. If deactivated, reactivate with a fresh paid period; if active, extend from its current expiry. Do not trust a stale checkout intent to choose the transition.
// 10. For a failed payment, mark it failed with a safe reason and do not change domain state. Ensure failure callbacks cannot downgrade a successful payment.
// 11. Commit payment and domain state together. Add a unique provider order/payment constraint to prevent duplicates.
// 12. Implement expiry and warning jobs as repeatable state transitions using indexed due-date queries and compare-and-update semantics.
// 13. Test invalid HMAC, malformed signed payloads, duplicate callbacks, out-of-order success/failure, expired domain at settlement, and ownership mismatch.
// 