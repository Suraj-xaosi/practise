# Exercise 2: Persist events and fan them out live

## Interviewer prompt

“The collector now accepts events. Build the next stage: persist events for historical reports and push them to dashboards watching the same site. The system must tolerate bursts, keep sites isolated, and avoid doing unnecessary work when nobody is watching.”

## Clarify before coding

- Can storage and live delivery fail independently?
- What makes an event belong to a domain?
- What is the expected behavior for malformed or duplicate queue messages?
- When should the consumer acknowledge a message?
- How will a newly connected dashboard know whether its live visitor counters are ready?

## Acceptance criteria

- Separate ingestion from storage and live fan-out.
- Persist the event with a stable event identity and useful indexes.
- Route messages by domain and only send to that domain's connected clients.
- Handle missing/invalid queue payloads explicitly.
- Explain retries, duplicate delivery, ordering, and consumer-group behavior.

## Follow-up questions

- How would you replay events after a bug fix?
- How would you scale consumers without reordering a single site's events?
- What backpressure behavior prevents an overloaded client from exhausting memory?
