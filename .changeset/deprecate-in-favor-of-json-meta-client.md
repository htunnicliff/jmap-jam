---
"jmap-jam": patch
"jmap-rfc-types": patch
---

jmap-jam and jmap-rfc-types have a successor: [json-meta-client](https://json-meta-client.dev), a ground-up redesign of the client and its types. Highlights:

- Typed support for all 12 stable JMAP RFCs
- Automatic batching of calls into a single request
- Improved experience for result references between calls
- More robust and clear error behavior
- Significantly improved event subscription experience
- WebSocket support (RFC 8887)
- Still zero runtime dependencies

The RFC types now ship as `json-meta-client/rfc-types`. See the [migration guide](https://json-meta-client.dev/migrating-from-jmap-jam) to switch over. jmap-jam and jmap-rfc-types are now deprecated.
