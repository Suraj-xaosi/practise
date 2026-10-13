# Exercise 7: Build a scoped AI traffic analyst

## Interviewer prompt

“Add a chat assistant that answers questions about one website's analytics. It may call analytics tools for time series, dimensions, exit pages, or page flow. The assistant must not invent data, query another user's site, or accept unbounded date ranges and conversation history.”

## Clarify before coding

- How is the current user/domain established?
- What analytics actions are available to the model?
- Which arguments must be validated outside the model?
- How do you constrain token use and history growth?
- How should the assistant respond when data is missing or the model/tool fails?

## Acceptance criteria

- Authorize the domain before constructing tools.
- Scope every tool to the authorized domain and site's timezone.
- Validate tool arguments and enforce range/result limits.
- Keep secrets and model calls server-side.
- Bound conversation history and total output/token budget.
- Distinguish evidence returned by tools from the model's explanation.

## Follow-up questions

- Can prompt injection in a page title or referrer cause a tool to access another domain?
- How would you cache tool results without mixing users or timezones?
- What should be logged for debugging without storing private chat content indefinitely?
