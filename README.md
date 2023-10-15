<div align="center">
  <img alt="Jam Illustration" src="./JMAP-Jam.png" height="100" />
  <h1 align="center">Jam: A JMAP Client</h1>
</div>

A tiny (<2kb gzipped), typed JMAP client with zero dependencies, adhering to the following IETF standards:

- [RFC 8620][jmap-rfc] - JMAP
- [RFC 8621][jmap-mail-rfc] - JMAP for Mail

> [!IMPORTANT]
> Version `0.x` is considered unstable. Breaking changes may occur until version `1.0` is published.

### To-do

- [ ] [RFC 8887][jmap-ws-rfc] - JMAP Subprotocol for WebSocket
- [ ] Fix [result reference][jmap-3.7-result-refs] types (these current work but may display TypeScript errors)

[jmap-rfc]: https://datatracker.ietf.org/doc/html/rfc8620
[jmap-mail-rfc]: https://datatracker.ietf.org/doc/html/rfc8621
[jmap-ws-rfc]: https://datatracker.ietf.org/doc/html/rfc8887

### Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Making Requests](#making-requests)
  - [Notes on Concurrency](#notes-on-concurrency)
- [TypeScript](#typescript)
- [API Reference](#api-reference)
  - [`#session`](#session)
  - [`requestMany()`](#requestmany)
  - [`requestManyOrFail()`](#requestmanyorfail)
  - [`request()`](#request)
  - [`requestOrFail()`](#requestorfail)
  - [`getPrimaryAccount()`](#getprimaryaccount)
  - [`downloadBlob()`](#downloadblob)
  - [`uploadBlob()`](#uploadblob)
  - [`connectEventSource()`](#connecteventsource)

## Installation

Jam works in any environment that supports the [Web Fetch API][mdn-using-fetch] and ES Modules, including Node.js (`>=18`) and the browser.

Use as a package:

```sh
npm install jmap-jam
```

Use in the browser:

```html
<script type="module">
  import { createClient } from "https://your-preferred-cdn.com/jmap-jam@<version>";
</script>
```

[mdn-using-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

## Getting Started

To initialize a client, provide the session URL for a JMAP server to connect to, as well as a bearer token for authenticating requests.

```ts
import { createClient } from "jmap-jam";

const client = createClient({
  sessionUrl: "https://jmap.example.com/.well-known/jmap",
  bearerToken: "super-secret-token",
});
```

### Making Requests

[JMAP][jmap-rfc] is a meta protocol that makes performing multiple, dependent operations on a server more efficient by accepting batches of them in a single HTTP request.

A request is made up of one or more [invocations][jmap-3.2] that each specify a method, arguments, and a method call ID (an arbitrary string chosen by the requester). Method calls can [reference each other][jmap-3.7-result-refs] with this ID, allowing for complex requests to be made.

To learn more about requests in JMAP, see the following resources:

- [JMAP Guides](https://jmap.io/spec.html) (JMAP website)
- [Standard Methods and Naming Conventions][jmap-5] (RFC 8620 § 5)
- [Entities and Methods for Mail][jmap-mail-rfc] (RFC 8621)

[jmap-5]: https://datatracker.ietf.org/doc/html/rfc8620#section-5

> Though JMAP examples often show multiple method calls being used in a single request, see the [Notes on Concurrency](#notes-on-concurrency) section for information about why a single method call per request can sometimes be more efficient.

Here's what a series of requests looks like with Jam using [`requestMany`](#requestmany):

```ts
const [result] = await client.requestMany({
  myMailboxes: [
    "Mailbox/get",
    {
      accountId: "123",
    },
  ],
  someEmails: [
    "Email/get",
    {
      accountId: "123",
      ids: ["id-456"],
    },
  ],
});
```

This will transform into the following JMAP request:

<!-- prettier-ignore -->
```jsonc
{
  "using": [
    "urn:ietf:params:jmap:core",
    "urn:ietf:params:jmap:mail",
  ],
  "methodCalls": [
    [
      "Mailbox/get", // <------------ Method name
      { "accountId": "123" }, // <--- Arguments
      "myMailboxes" // <------------- Method call ID
    ],
    [
      "Email/get",
      {
        "accountId": "123",
        "ids": ["id-456"]
      },
      "someEmails"
    ]
  ]
}
```

You can also use [`request`](#request), [`requestOrFail`](#requestorfail), or [`requestManyOrFail`](#requestmanyorfail).

[jmap-3.2]: https://datatracker.ietf.org/doc/html/rfc8620#section-3.2
[jmap-3.7-result-refs]: https://datatracker.ietf.org/doc/html/rfc8620#section-3.7

### Notes on Concurrency

> [RFC 8620 § 3.10][jmap-3.10]: Method calls within a single request MUST be executed in order \[by the server]. However, method calls from different concurrent API requests may be interleaved. This means that the data on the server may change between two method calls within a single API request.

JMAP supports passing multiple method calls in a single request, but it is important to remember that each method call will be executed in sequence, not concurrently.

To make concurrent method calls, send them in separate requests.

In sum:

- Prefer using [`request`](#request)/[`requestOrFail`](#requestorfail), parallelizing when desired (e.g. with [`Promise.all`][promise-all]).
- If a method call needs the output of another method call, use [`requestMany`](#requestmany)/[`requestManyOrFail`](#requestmanyorfail) to take advantage of [result references][jmap-3.7-result-refs].
- Or, if reducing the quantity of HTTP requests is more important than concurrency, use [`requestMany`](#requestmany)/[`requestManyOrFail`](#requestmanyorfail) to send multiple method calls in a single request even if they aren't dependent on each other.

[jmap-3.10]: https://datatracker.ietf.org/doc/html/rfc8620#section-3.10
[promise-all]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all

## TypeScript

Jam provides types for JMAP methods, arguments, and responses as described in the [JMAP][jmap-rfc] and [JMAP Mail][jmap-mail-rfc] RFCs.

Using any of the `request*` methods will reveal autosuggested types for method names (e.g. `Email/get`), the arguments for that method, and the appropriate response.

Many response types will infer from arguments. For example, when using an argument field such as `properties` to filter fields in a response, the response type will be narrowed to exclude fields that were not included.

## API Reference

### `#session`

Get the client's current session.

```js
const session = await client.session;
console.log(session); // =>
// {
//   capabilities: { ... },
//   accounts: { ... },
//   primaryAccounts: { ... },
//   ...
// }
```

### `requestMany()`

Send a standard JMAP request.

This accepts multiple method calls and returns success
or error results for each method call.

```js
const [results] = await client.requestMany({
  mailboxes: ["Mailbox/get", { accountId, properties: ["name"] }],
  emails: ["Email/get", { accountId, properties: ["subject"] }],
});
console.log(results); // =>
// {
//   mailboxes: { data: { ... } }, // or { error: { ... } }
//   emails: { data: { ... } }, // or { error: { ... }
// }
```

### `requestManyOrFail()`

Send a standard JMAP request.

This accepts multiple method calls and only returns success results.
If any method calls result in an error, the function will throw.

```js
const [results] = await client.requestManyOrFail({
  mailboxes: ["Mailbox/get", { accountId, properties: ["name"] }],
  emails: ["Email/get", { accountId, properties: ["subject"] }],
});
console.log(results); // =>
// {
//   mailboxes: { ... },
//   emails: { ... },
// }
```

### `request()`

Send a JMAP request with only a single method call.

This accepts one method call and returns a success or error result.

```js
const [mailboxes] = await client.request([
  "Mailbox/get",
  { accountId, properties: ["name"] },
]);
console.log(mailboxes); // =>
// { data: { ... } } // or { error: { ... } }
```

### `requestOrFail()`

Send a JMAP request with only a single method call.

This accepts one method call and only returns a success result.
If an error occurs, the function will throw.

```js
const [mailboxes] = await client.requestOrFail([
  "Mailbox/get",
  { accountId, properties: ["name"] },
]);
console.log(mailboxes); // =>
// [
//   { name: "Inbox" },
//   { name: "Drafts" },
//   ...
// ]
```

### `getPrimaryAccount()`

Get the ID of the primary mail account for the current session.

```js
const accountId = await client.getPrimaryAccount();
console.log(accountId); // => "abcd"
```

### `downloadBlob()`

Intiate a fetch request to download a specific blob. Downloading a blob requires both a [MIME type](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type) and file name, since JMAP server implementations are not required to store this information.

If the JMAP server sets a `Content-Type` header in its response, it will use the value provided in `mimeType`.

If the JMAP server sets a `Content-Disposition` header in its response, it will use the value provided in `fileName`.

```js
const response = await client.downloadBlob({
  accountId,
  blobId: 'blob-123'
  mimeType: 'image/png'
  fileName: 'photo.png'
});

const blob = await response.blob();
// or response.arrayBuffer()
// or response.text()
// ...etc
```

### `uploadBlob()`

Initiate a fetch request to upload a blob.

```js
const data = await client.uploadBlob(
  accountId,
  new Blob(["hello world"], { type: "text/plain" })
);
console.log(data); // =>
// {
//   accountId: "account-abcd",
//   blobId: "blob-123",
//   type: "text/plain",
//   size: 152,
// }
```

### `connectEventSource()`

Connect to a JMAP event source using [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

> [!NOTE]
> At the time of this writing, the popular JMAP server host Fastmail has not implemented support for server-sent events.

```js
const sse = await client.connectEventSource({
  types: "*", // or ["Mailbox", "Email", ...]
  ping: 5000, // ping interval in milliseconds
  closeafter: "no", // or "state"
});

sse.addEventListener("message", (event) => ...));
sse.addEventListener("error", (event) => ...));
sse.addEventListener("close", (event) => ...));
```
