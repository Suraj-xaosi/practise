// # Raw implementation logic
// 
// First simulate the pipeline with a bounded in-process queue; then make the boundaries explicit so a durable broker can replace it.
// 
// 1. Define a versioned event envelope with `eventId`, `domainId`, `visitorId`, page, timestamp, and enrichment fields.
// 2. Give the event one producer entry point. Validate the envelope again at the consumer because queue contents are also an input boundary.
// 3. Implement a bounded queue with a maximum length and an explicit full-queue policy. For a teaching version, reject new work and return an error rather than silently dropping events.
// 4. Create a worker loop that dequeues one message, parses it, checks required identifiers, and writes it to a relational database with parameterized SQL.
// 5. Add a unique constraint on `eventId`. If a retry repeats an already-persisted event, treat the unique conflict as an idempotent duplicate; propagate unrelated database errors.
// 6. Acknowledge/remove a message only after successful persistence or a deliberate terminal-invalid-message decision. Retain/retry transient failures with a capped delay and a dead-letter path after a bounded number of attempts.
// 7. Maintain a `Map<domainId, Set<socket>>` for live subscribers. Authenticate a dashboard connection, authorize its domain, and register/unregister it on connect/close.
// 8. Publish the live event only to open sockets subscribed to the same domain. Do not broadcast across domains.
// 9. Track queue depth, retry count, malformed-message count, persistence latency, and slow-client drops.
// 10. Explain why the in-memory queue is not durable and replace only that queue adapter with Kafka in the production pass.
// 