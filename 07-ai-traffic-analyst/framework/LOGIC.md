# Framework implementation logic

Rebuild with the project's Next.js chat route, server-only agent, LangChain tools, shared validation, and token/history guards.

1. In the route handler, authenticate the user and verify access to the active domain before creating the agent. Resolve the site's timezone from trusted domain data.
2. Validate the incoming chat body with a shared runtime schema; cap message count and content length. Do not pass client-supplied ownership information into tools.
3. Build tools with `domainId` and timezone captured in server-side closures. Each tool must still validate its own date/dimension arguments and use existing authorized analytics functions.
4. Keep tool outputs compact and typed. Return counts, labels, buckets, and requested range only; do not expose DB rows or credentials.
5. Apply history trimming and token-budget helpers before invocation. Limit tool iterations and model output; reject unsupported tool calls rather than falling back to arbitrary execution.
6. Use the server-only model configuration. Never import model secrets into client components or public environment variables.
7. Catch known provider timeout/rate-limit failures at the route boundary and return an explicit retryable error. Log a request ID and failure category without dumping sensitive prompts or raw analytics.
8. Format the final response as a stable API contract and validate/limit its size before returning it to the client.
9. Test domain authorization before agent construction, tool scoping, invalid tool inputs, history trimming, token exhaustion, and provider/tool errors.
