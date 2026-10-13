# Framework implementation logic

Rebuild using the project's Next.js routes, session/auth layer, Prisma models, and payment webhook route pattern.

1. Reuse the established authentication/session helper. Resolve the user on the server and scope each domain query by `userId`; do not rely on hiding unauthorized controls in the UI.
2. Generate domain API keys with Node crypto. Persist a hash if the collector lookup path is updated consistently; never return a stored key in normal domain responses.
3. Keep domain state transitions in service functions. Validate current state and ownership before generating a payment order; derive price from server-side pricing configuration.
4. In the webhook route, read `req.text()`/raw bytes before JSON parsing. Compute the HMAC using the configured secret and compare safely; reject missing/invalid signatures before touching payment records.
5. Validate the signed event's shape and required provider identifiers. Look up the stored payment by provider order ID and verify its expected amount/currency where available.
6. Use `prisma.$transaction` to check pending status, mark success, and update the domain as one atomic operation. A duplicate callback for a resolved payment should return a successful acknowledgement without reapplying changes.
7. Determine activation versus extension from the domain's current state at settlement time, not only from the purpose saved when checkout began.
8. On failure callbacks, update only a pending payment. Preserve successful settlement against delayed/duplicated failure events.
9. Use scheduled lifecycle jobs for expiry and warning notices, with database filters/indexes for due domains. Make notification jobs idempotent.
10. Test the webhook handler with signed raw-body fixtures, transaction outcomes, duplicate deliveries, and concurrent callbacks. Keep provider secrets in server-only environment configuration.
