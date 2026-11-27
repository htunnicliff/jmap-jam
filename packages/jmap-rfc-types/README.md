> [!TIP]
> **These types have a new home in [json-meta-client](https://json-meta-client.dev)!**
> They now ship with the json-meta-client package as `json-meta-client/rfc-types`, and cover all 12 stable JMAP RFCs, up from 2 here. See the [Types section of the migration guide](https://json-meta-client.dev/migrating-from-jmap-jam#types) to switch over. jmap-rfc-types is now deprecated.

# JMAP RFC Types

<p align="center">
  <a href="https://www.npmjs.com/package/jmap-rfc-types">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/jmap-rfc-types">
  </a>
  <a href="https://github.com/htunnicliff/jmap-jam/blob/main/packages/jmap-rfc-types/LICENSE.txt">
    <img alt="License" src="https://img.shields.io/npm/l/jmap-rfc-types">
  </a>
</p>

This package contains TypeScript types modeled upon the JMAP[^1] RFCs.

## Overview

| RFC                                 | Types                                |
| ----------------------------------- | ------------------------------------ |
| [RFC 8620: JMAP][jmap-rfc]          | [`jmap.ts`](./lib/jmap.ts)           |
| [RFC 8621: JMAP for Mail][mail-rfc] | [`jmap-mail.ts`](./lib/jmap-mail.ts) |

[jmap-rfc]: https://datatracker.ietf.org/doc/html/rfc8620
[mail-rfc]: https://datatracker.ietf.org/doc/html/rfc8621

[^1]: JSON Meta Application Protocol
