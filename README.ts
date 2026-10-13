// # WebAnly Live-Coding Practice Roadmap
// 
// This guide turns the strongest engineering problems in WebAnly into interview-style exercises you can implement yourself. It is a learning companion, not a copy of the production source.
// 
// ## How to use it
// 
// 1. Pick an exercise and read its `about.ts` as if an interviewer gave it to you.
// 2. Before coding, explain your data model, request/response shape, failure cases, and trade-offs out loud.
// 3. Implement the `raw/LOGIC.ts` version first using platform APIs and explicit logic. Avoid framework abstractions in this pass.
// 4. Rebuild the same behavior using the project stack in `framework/LOGIC.ts`. Framework-specific work does not replace the raw version.
// 5. Check your result against the acceptance criteria and follow-up questions in the brief.
// 6. Add tests for boundaries, duplicate messages, invalid input, and failures before polishing the UI.
// 
// Each exercise has the same structure:
// 
// ```text
// NN-exercise-name/
//   about.ts
//   raw/
//     LOGIC.ts
//   framework/
//     LOGIC.ts
// ```
// 
// ## Recommended order
// 
// | #   | Exercise                                | Main concepts                                                   |
// | --- | --------------------------------------- | --------------------------------------------------------------- |
// | 1   | Browser event collection                | Browser APIs, HTTP, validation, privacy, rate limiting          |
// | 2   | Durable event pipeline and live fan-out | Queues, Kafka, persistence, WebSockets, idempotency             |
// | 3   | Timezone-aware analytics and page flow  | SQL, aggregation, dates, access control, caching                |
// | 4   | Live dashboard state                    | WebSocket client, reconnects, state reconciliation, React Query |
// | 5   | Adaptive traffic spike alerts           | Sliding windows, baselines, scheduled work, notifications       |
// | 6   | Domain lifecycle and payment webhook    | Ownership, state machines, HMAC, transactions, idempotency      |
// | 7   | Scoped AI traffic analyst               | Tool calling, authorization, input/output limits, safe context  |
// 
// ## What “raw” means here
// 
// The raw pass uses browser and Node.js primitives, plain functions, HTTP, and parameterized SQL. You may use a basic database driver where a connection is needed, but do not use Express, Next.js, Prisma, React, TanStack Query, LangChain, or Kafka in the raw implementation. Model queues and framework behavior explicitly and call out where a production service would replace the teaching version.
// 
// The framework pass rebuilds the same feature using the actual project patterns and stack: Express, Next.js route handlers, Prisma, Kafka, Redis, WebSockets, React, TanStack Query, and the AI tool layer where appropriate.
// 
// ## Scope notes
// 
// - Start with the smallest correct end-to-end slice. Add scaling features only after correctness.
// - Treat browser-provided values as untrusted. API keys identify a site; they do not prove a browser origin is trustworthy.
// - Keep secrets on the server. Do not put API secrets in a tracker script or browser bundle.
// - Use parameterized queries, validate every boundary, and keep user/domain access checks in the server path.
// - The current repository has unrelated local edits. This guide is added as a separate learning area and does not change application code.
// 