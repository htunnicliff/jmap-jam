import type { EmailSubmission } from "./email-submission.ts";
import type { Email } from "./email.ts";
import type { Identity } from "./identity.ts";
import type { Mailbox } from "./mailbox.ts";
import type { SearchSnippet } from "./search-snippet.ts";
import type { Thread } from "./thread.ts";
import type { VacationResponse } from "./vacation-response.ts";

/**
 * JMAP Mail
 *
 * [rfc8621](https://datatracker.ietf.org/doc/html/rfc8621)
 */

export type Entities = {
  Mailbox: Mailbox;
  Thread: Thread;
  Email: Email;
  SearchSnippet: SearchSnippet;
  Identity: Identity;
  EmailSubmission: EmailSubmission;
  VacationResponse: VacationResponse;
};

export type Entity = keyof Entities;
