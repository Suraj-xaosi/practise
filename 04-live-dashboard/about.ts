// # Exercise 4: Reconcile a live dashboard with history
// 
// ## Interviewer brief
// 
// “A dashboard loads historical analytics over HTTP and then receives new events over a WebSocket. Implement a live chart/card update that stays responsive under bursts and does not double-count when the HTTP snapshot and socket stream overlap.”
// 
// ## Clarify before coding
// 
// - Which side owns the initial snapshot?
// - What identifies a visitor versus an event?
// - How do reconnects and duplicate messages affect counts?
// - Which state belongs in the WebSocket connection and which belongs in the query cache?
// - How will you clean up listeners and timers when the dashboard unmounts?
// 
// ## Acceptance criteria
// 
// - Subscribe only to an authorized domain.
// - Handle open/message/error/close states and reconnect with bounded exponential backoff.
// - Validate incoming messages before updating state.
// - Batch bursts instead of triggering one render per event.
// - Prevent duplicate event/visitor counting and keep query keys domain/date scoped.
// - Explain snapshot/stream race handling.
// 
// ## Follow-up questions
// 
// - How would you synchronize after a long disconnect?
// - What happens when the server sends a message type the client does not recognize?
// - Why might server-sent events be enough for this use case?
// 