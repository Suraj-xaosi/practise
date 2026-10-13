// # Raw implementation logic
// 
// Implement the detector as a deterministic function first, then wrap it in a simple scheduler/queue.
// 
// 1. Define inputs: current expected unique visitors per window, observed unique visitors for the completed window, growth/decay factors, minimum baseline, and alert threshold.
// 2. Count distinct visitor IDs per domain and window, not raw event rows. Make the window boundary explicit and use one clock/timezone convention.
// 3. Compare observed count with the expected baseline. Emit a spike decision only when the configured condition is met; calculate the difference for alert context.
// 4. Adapt upward only on a qualifying spike, for example `ceil(expected * 1.10)`. Adapt downward only when traffic falls below a quiet threshold, for example `floor(expected * 0.90)`. Clamp at a minimum of one.
// 5. Return a decision object (`observed`, `previousExpected`, `nextExpected`, `shouldAlert`, `windowStart`, `windowEnd`) without performing I/O.
// 6. Have a scheduler select only active domains due for evaluation. Add a lease/lock or database claim so two job instances do not evaluate the same domain/window simultaneously.
// 7. In one transaction, record a unique detector result keyed by domain and window and update the baseline. The uniqueness constraint makes retries idempotent.
// 8. Insert an alert into a transactional outbox in the same transaction. A separate worker publishes outbox rows and marks them delivered only after success.
// 9. Make notification consumers idempotent using the alert ID. Retry transient delivery errors with a cap; dead-letter persistent failures and surface them operationally.
// 10. Test exact threshold boundaries, minimum baseline, duplicate job runs, missing domains, zero visitors, and notification retry after a committed detection.
// 