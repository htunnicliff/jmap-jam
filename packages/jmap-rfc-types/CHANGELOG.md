# jmap-rfc-types

## 0.5.1

### Patch Changes

- [#491](https://github.com/htunnicliff/jmap-jam/pull/491) [`8f96ae3`](https://github.com/htunnicliff/jmap-jam/commit/8f96ae3485aa2158c58be9b4fddf243bbed2cf3e) Thanks [@htunnicliff](https://github.com/htunnicliff)! - jmap-jam and jmap-rfc-types have a successor: [json-meta-client](https://json-meta-client.dev), a ground-up redesign of the client and its types. Highlights:

  - Typed support for all 12 stable JMAP RFCs
  - Automatic batching of calls into a single request
  - Improved experience for result references between calls
  - More robust and clear error behavior
  - Significantly improved event subscription experience
  - WebSocket support (RFC 8887)
  - Still zero runtime dependencies

  The RFC types now ship as `json-meta-client/rfc-types`. See the [migration guide](https://json-meta-client.dev/migrating-from-jmap-jam) to switch over. jmap-jam and jmap-rfc-types are now deprecated.

## 0.5.0

### Minor Changes

- [#400](https://github.com/htunnicliff/jmap-jam/pull/400) [`b98dd7a`](https://github.com/htunnicliff/jmap-jam/commit/b98dd7ab1a3cf6ec653c0c411932c75285e5cbd1) Thanks [@htunnicliff](https://github.com/htunnicliff)! - Adopt more accurate contract types using polymorphic this to preserve generic behavior

## 0.4.1

### Patch Changes

- 5d336b8: Small type tweaks to better adhere to RFC 8621

## 0.4.0

### Minor Changes

- 94f0bd1: Add missing core export

## 0.3.1

### Patch Changes

- b258bde: Add missing email contracts export

## 0.3.0

### Minor Changes

- f5d2df5: Began adding contracts as namespaces

## 0.2.0

### Minor Changes

- 30d846c: Refactor TypeScript enums to POJOs for erasableSyntaxOnly
- 30d846c: Remove redundant `string | SomeError` unions

## 0.1.3

### Patch Changes

- 1911cc4: Small linting fixes

## 0.1.2

### Patch Changes

- a00c349: Added badges to README

## 0.1.1

### Patch Changes

- 7e2e394: Add .npmignore

## 0.1.0

### Patch Changes

- 2ffeb7b: Move JMAP types into separate package
