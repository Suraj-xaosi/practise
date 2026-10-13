// # Raw implementation logic
// 
// Use the browser `WebSocket` API and plain JavaScript state before introducing React or a query cache.
// 
// 1. Define the socket message envelope (`type`, `eventId`, `domainId`, `data`, optional sequence/cursor) and a runtime validator for each supported message type.
// 2. Fetch the authorized historical snapshot first. Record its end time or cursor if the server supplies one; the ideal server contract returns a snapshot watermark.
// 3. Open one WebSocket for the selected domain and send a subscription request only after connection establishment. The server must authenticate and authorize the subscription.
// 4. Handle open, message, error, and close events. Parse JSON inside a narrow parse boundary, validate the envelope, and ignore/log unknown message types without crashing the UI.
// 5. Merge a new event into the relevant time bucket and dimension counts. Track recently applied `eventId`s (or a monotonic cursor) so reconnect/replay duplicates are not counted twice.
// 6. Handle the overlap between snapshot and socket data with a watermark: ignore events at or before the snapshot cursor. If there is no cursor contract, document that exact-once visual counts cannot be guaranteed and use an explicit refresh/reconciliation policy.
// 7. Buffer incoming messages for a short window (for example, 100 ms), reduce the buffer in order, and update state once per batch.
// 8. Reconnect after an unexpected close using capped exponential backoff plus jitter. Reset the delay after a stable connection; stop reconnecting after intentional unsubscribe/unmount.
// 9. On reconnect, request events after the last applied cursor or refetch a fresh snapshot and replace state. Do not blindly replay a stream into already-counted totals.
// 10. Bound buffers and dedupe history. On overflow, pause or discard with an explicit resync signal rather than growing memory forever.
// 11. On page exit or domain switch, unsubscribe, close the socket, clear timers/listeners, and ensure messages from the old domain cannot mutate the new dashboard.
// 12. Test duplicate messages, out-of-order cursors, reconnect, malformed payloads, no initial snapshot, rapid bursts, and cleanup.
// 