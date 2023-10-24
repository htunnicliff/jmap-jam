// Client
export * from "./client";
export { JamClient as default } from "./client";

// -------------------------------------------------
// Types
// -------------------------------------------------

// Request and response contracts
export type * from "./types/contracts";

// JMAP
export type * from "./types/jmap";
export type * as JMAP from "./types/jmap";

// JMAP Mail
export type * from "./types/jmap-mail";
export type * as JMAPMail from "./types/jmap-mail";
