// # Raw implementation logic
// 
// Build a safe tool-calling shell without an agent framework. The model provider is an adapter; authorization and analytics stay ordinary application code.
// 
// 1. Authenticate the user and resolve one requested domain through an ownership check. Stop before any model call if access fails.
// 2. Define an allowlist of analytics tools (time series, dimension breakdown, exit pages, page flow). Give each tool a strict input schema, maximum date range, row limit, and timeout.
// 3. Bind the authorized `domainId` and validated reporting timezone on the server. Do not expose domain ID as a model-controlled tool argument.
// 4. Accept a bounded conversation: validate message roles/content sizes, keep only a recent window, and remove unsupported/tool-injected message shapes.
// 5. Send the model the user request plus tool definitions and a token/output budget. Treat any requested tool call as untrusted input.
// 6. Validate the requested tool name and arguments against the allowlist/schema. Reject extra keys, invalid dates/timezones, large ranges, and unsupported dimensions.
// 7. Execute the selected analytics function with parameterized SQL and the server-bound domain ID. Return compact structured facts and range metadata, not entire database rows.
// 8. Append the tool result to the model conversation and allow a bounded number of tool-call rounds. Prevent recursive or parallel calls from exceeding the budget.
// 9. Ask the model to explain only the returned evidence. Clearly say when the dataset is empty or the tool failed; never convert an error into fabricated analytics.
// 10. Validate and length-limit the final response. Return a structured response with answer, citations/range metadata, and a request ID.
// 11. Handle model timeouts/rate limits explicitly and avoid logging API keys, full analytics payloads, or unnecessary chat history.
// 12. Test unauthorized domains, input-injection attempts, tool argument tampering, huge ranges, empty results, model/tool failure, and token-budget exhaustion.
// 