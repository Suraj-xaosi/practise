// # Raw implementation logic
// 
// Use plain functions, HTTP handling, and parameterized SQL. Make the timezone conversion utility testable without a database.
// 
// 1. Parse `domainId`, `from`, `to`, `timezone`, and optional dimension/page parameters from the request. Reject missing values, invalid `YYYY-MM-DD` dates, reversed ranges, unknown dimensions, and invalid IANA timezones.
// 2. Define the date-range contract explicitly: local calendar dates are inclusive, and the SQL range is `[startOfFromDay, startOfDayAfterTo]` in UTC.
// 3. Convert each local midnight independently using timezone-aware APIs or a well-tested timezone library. Do not add 24 hours in milliseconds to find the next local midnight; DST can make a local day shorter or longer.
// 4. Authenticate the caller and check domain ownership/permission and active state before running analytics SQL. Never accept a trusted user ID or owner ID from query parameters.
// 5. Use parameterized SQL with a mandatory `domain_id` filter and half-open timestamp bounds. Allowlist SQL identifiers such as a dimension column; values can be parameters but column names cannot.
// 6. For a time series, group by a timezone-aware bucket and fill absent buckets with zero in a post-processing pass if the UI expects a continuous chart.
// 7. For a dimension breakdown, group/count in SQL, order deterministically by count then label, and cap the number of rows.
// 8. For exit pages, select the intended exit event semantics, group by page, and keep the definition consistent with page-view totals.
// 9. For page flow, group transitions by `previousPage -> page`; ignore missing/self transitions as required. For an “all pages” graph, cap nodes/edges and avoid generating a combinatorial result.
// 10. Return the same response shape for empty data as for populated data, with an empty list and explicit range metadata.
// 11. Cache past date ranges longer than ranges containing the site's current local date. Include domain, dimension, page, date range, timezone, and schema/version in the cache key.
// 12. Test boundary instants, timezone changes, DST transition dates, empty data, unauthorized domains, SQL-injection-shaped dimensions, and very large ranges.
// 