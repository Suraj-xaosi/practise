# Exercise 3: Build timezone-aware analytics and page flow

## Interviewer prompt

“Implement an analytics endpoint for one tracked domain. It should return a traffic time series or a breakdown such as top pages/countries, and it should support a page-flow view. ‘Today’ is based on the site's chosen timezone, not the database server's timezone.”

## Clarify before coding

- What date and timezone formats do you accept?
- Are end dates inclusive?
- How do you translate a local calendar day into UTC database boundaries, including daylight-saving changes?
- How do you verify the caller can see the requested domain?
- How do you prevent expensive, unbounded queries?

## Acceptance criteria

- Validate domain, date range, dimension, page, and IANA timezone.
- Use parameterized queries and database-side aggregation.
- Return predictable empty-result shapes and bounded result sizes.
- Keep domain authorization separate from analytics aggregation.
- Include top dimensions, time buckets, and page-flow edges with explicit counts.
- Cache stable historical ranges longer than data for the current day.

## Follow-up questions

- What is the difference between a page view and a unique visitor?
- How would you query a large event table efficiently?
- How would you handle DST days that are not 24 hours long?
