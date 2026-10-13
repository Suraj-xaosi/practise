# Framework implementation logic

Rebuild the same collector with the project's Express, shared Zod contracts, Redis limits, and Kafka producer. Keep the canonical event independent of Express request objects.

1. Export a Zod collector schema from the shared types package. Infer the TypeScript input type from the schema instead of maintaining two contracts.
2. Add an Express route that enforces JSON content type and a body-size limit, validates the body, and forwards a typed input to the collector service.
3. Use the existing async error middleware pattern. Translate known client failures to deliberate 4xx responses and let unexpected infrastructure errors reach centralized logging/error handling.
4. Resolve the API key through one server helper; check domain state before processing. Keep origin/referrer checks as an abuse signal, not proof of identity.
5. Apply IP limits first, then API-key limits. Return a rate-limit response with retry guidance instead of continuing to GeoIP or Kafka.
6. Reuse path, timestamp, referrer, IP, and exit-type parsing helpers. Make malformed required data a validation failure; use explicit unknown values for optional enrichment that is unavailable.
7. Build a typed canonical event with the server-resolved domain ID and enrichments. Keep browser-supplied `domainId` out of the trusted contract.
8. Publish the historical event to the site-events topic and the live event to the socket-events topic. Use the domain ID as the Kafka key so related events have stable partition affinity.
9. Treat publish failures as failures of ingestion: report an error and do not return a success-shaped response. Define whether the request waits for broker acknowledgement and document the durability trade-off.
10. Add tests for schema rejection, limiter short-circuiting, inactive domains, event normalization, producer failure, and the two expected topic payloads.
