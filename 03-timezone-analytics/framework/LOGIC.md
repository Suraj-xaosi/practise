# Framework implementation logic

Rebuild with Next.js route handlers, the shared Prisma client, existing analytics helpers, and Redis cache conventions.

1. Create one route handler per response shape (time series, dimension, dimension time series, exit pages, page flow). Keep route parsing and response status handling thin.
2. Parse the query string once. Validate required IDs, dates, IANA timezone, dimension allowlist, and pagination/range limits before calling a query helper.
3. Call the shared domain-access helper before database aggregation. It should establish the current user from the session, verify ownership, and enforce the domain's active state.
4. Convert validated local date bounds to UTC instants with shared timezone helpers. Keep the exclusive upper bound at the next local day's midnight.
5. Put aggregation logic in focused DB functions. Use Prisma's safe query APIs or parameterized raw SQL; never interpolate user-provided values into SQL identifiers.
6. Reuse shared analytics constants and response types so dashboard cards and route handlers agree on bucket sizes, allowed dimensions, and empty shapes.
7. For flow results, return page nodes and transition edges with counts. Apply an explicit cap/limit and stable sorting before returning graph data.
8. Cache past immutable ranges with a longer TTL and today's accumulating range with a short TTL. Ensure timezone and every query-defining parameter participate in the cache key.
9. Convert known validation/access/database failures to deliberate responses. Use the shared route error helper for unexpected failures and log enough context without leaking secrets.
10. Add focused tests for route validation, access denial, SQL/query arguments, timezone boundaries, cache key separation, and empty results.
