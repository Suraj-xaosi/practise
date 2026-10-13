# Exercise 6: Secure domain lifecycle and payment settlement

## Interviewer prompt

“Users can register a website, receive a domain-scoped analytics key, and pay to activate or extend tracking. Implement access checks and a payment webhook that safely handles duplicate delivery and domain expiry while checkout is in progress.”

## Clarify before coding

- Which actions require an authenticated owner?
- What is the difference between an active free domain, an active paid domain, and a deactivated domain?
- Is the intended payment purpose authoritative when the webhook arrives?
- How do you verify webhook signatures and make retries safe?
- What state changes belong in one database transaction?

## Acceptance criteria

- Every domain operation is scoped to the authenticated owner.
- Store only a hash of a generated high-entropy API key when practical; show the raw key only at creation.
- Model lifecycle transitions explicitly and enforce expiry on both scheduled and request paths.
- Verify the signature over the exact webhook bytes before parsing or mutating data.
- Make webhook processing idempotent and settle payment plus domain state atomically.
- Test stale checkout intent, duplicate success/failure delivery, invalid signatures, and unauthorized access.

## Follow-up questions

- How do you rotate/revoke a domain API key?
- What if payment capture arrives after the domain has expired?
- How do you keep the user's browser return page from being the source of truth for payment success?
