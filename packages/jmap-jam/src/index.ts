// Client
export * from "./client.ts";
export { JamClient as default } from "./client.ts";

// Utils
export * from "./utils.ts";

// -------------------------------------------------
// Types
// -------------------------------------------------

// Request and response contracts
export type * from "./types/contracts.ts";

// JMAP
export type * from "./types/jmap.ts";
export type * as JMAP from "./types/jmap.ts";

// JMAP Mail
export type * from "./types/jmap-mail.ts";
export type * as JMAPMail from "./types/jmap-mail.ts";
