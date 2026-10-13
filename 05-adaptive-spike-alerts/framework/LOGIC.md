# Framework implementation logic

Rebuild with the project's scheduled server job, Prisma, Redis activity set, Kafka topics, and notification worker.

1. Keep the baseline calculation pure and test it independently from Prisma/Redis/Kafka.
2. Use Redis activity tracking to avoid scanning every domain each run, but periodically reconcile that set against active domains so stale members do not persist forever.
3. Count distinct visitor IDs over the agreed five-minute interval. Ensure Redis key design includes the domain and window boundary and has an expiration/cleanup strategy.
4. Load the domain and expected baseline; skip missing/deactivated domains explicitly. Never silently assume an unset baseline.
5. On a spike, publish a notification event containing a stable alert ID, domain ID, observed count, expected count, and window. Key Kafka messages by domain.
6. Update the baseline with the documented growth/decay factors and minimum. Guard concurrent executions with a Redis lock or database compare-and-update so overlapping jobs do not overwrite each other's decisions.
7. Consider the failure ordering: if publishing succeeds but baseline persistence fails, a retry could alert twice. Add a unique alert/window record or outbox if stronger delivery guarantees are required.
8. Consume notification messages in a separate worker and persist notifications idempotently before exposing them to the dashboard.
9. Record job start/end, domains checked, spikes, skips, failures, and duration. Log errors with domain/window context and preserve retry visibility.
10. Test the detector, Redis counts/key expiration, lock contention, Kafka publish failure, duplicate notification, and lifecycle filtering.
