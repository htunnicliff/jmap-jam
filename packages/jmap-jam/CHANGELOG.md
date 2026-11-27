# jmap-jam

## 0.13.9

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

- Updated dependencies [[`8f96ae3`](https://github.com/htunnicliff/jmap-jam/commit/8f96ae3485aa2158c58be9b4fddf243bbed2cf3e)]:
  - jmap-rfc-types@0.5.1

## 0.13.8

### Patch Changes

- Updated dependencies [[`b98dd7a`](https://github.com/htunnicliff/jmap-jam/commit/b98dd7ab1a3cf6ec653c0c411932c75285e5cbd1)]:
  - jmap-rfc-types@0.5.0

## 0.13.7

### Patch Changes

- 5d336b8: Small type tweaks to better adhere to RFC 8621
- Updated dependencies [5d336b8]
  - jmap-rfc-types@0.4.1

## 0.13.6

### Patch Changes

- Updated dependencies [94f0bd1]
  - jmap-rfc-types@0.4.0

## 0.13.5

### Patch Changes

- Updated dependencies [b258bde]
  - jmap-rfc-types@0.3.1

## 0.13.4

### Patch Changes

- Updated dependencies [f5d2df5]
  - jmap-rfc-types@0.3.0

## 0.13.3

### Patch Changes

- Updated dependencies [30d846c]
- Updated dependencies [30d846c]
  - jmap-rfc-types@0.2.0

## 0.13.2

### Patch Changes

- 1911cc4: Small linting fixes
- Updated dependencies [1911cc4]
  - jmap-rfc-types@0.1.3

## 0.13.1

### Patch Changes

- c652799: Fix license badge link
- 1a5f48e: Added missing array to capabilities Set
- Updated dependencies [a00c349]
  - jmap-rfc-types@0.1.2

## 0.13.0

### Minor Changes

- 0147bf5: All requests will now include the `urn:ietf:params:jmap:core` capability

## 0.12.1

### Patch Changes

- 7e2e394: Add .npmignore
- Updated dependencies [7e2e394]
  - jmap-rfc-types@0.1.1

## 0.12.0

### Minor Changes

- 2ffeb7b: Move JMAP types into separate package

### Patch Changes

- fb8d17b: Fix lint errors
- 97a4e87: Modify typescript config
- Updated dependencies [2ffeb7b]
  - jmap-rfc-types@0.1.0

## 0.11.0

### Minor Changes

- d2eb111: Improve email header types

### Patch Changes

- 5bedd7b: Fix incorrect bodyProperties types

## 0.10.1

### Patch Changes

- 9355373: Update repository directory in package.json
