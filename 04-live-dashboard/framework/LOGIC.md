# Framework implementation logic

Rebuild with the project's WebSocket hook, React, and TanStack Query.

1. Keep a single connection/subscription layer responsible for authentication, domain subscription, message parsing, and cleanup. Expose a typed subscribe/unsubscribe API to feature hooks.
2. Scope every TanStack query key by domain and every filter that affects the response. Clear or switch keys when the selected domain/date range changes.
3. Fetch the historical response with TanStack Query and use loading/error states rather than rendering a fabricated empty success.
4. Write a pure merge function per response type. It should accept prior query data and one validated socket message, return the updated shape, and be safe to unit test.
5. Reuse a batching hook: collect messages over a short fixed window, reduce them into one cache update, and use React's transition mechanism for non-urgent chart updates.
6. Retain the current query client, key, and merge function with refs so a stable socket subscription does not capture stale values.
7. Add cursor/event-ID deduplication in the contract and merge layer. A client-only memory set is not sufficient across reloads; use a snapshot cursor if exact reconciliation matters.
8. Ensure effects unsubscribe, clear pending timers, and discard queued messages during unmount/domain change.
9. Show an explicit reconnecting/stale indicator and trigger a refetch or cursor-based catch-up after reconnect. Do not claim the displayed totals are current if the stream is disconnected.
10. Test pure merge helpers and hook lifecycle: bursts batch once, duplicate IDs do not add twice, query keys stay isolated, and unmount cleans up.
