import type { FilterCondition, ID, UTCDate } from "./jmap.ts";

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

// =================================
// Mailboxes
// =================================

/**
 * [rfc8621 § 2](https://datatracker.ietf.org/doc/html/rfc8621#section-2)
 */
export type Mailbox = {
  id: ID;
  name: string;
  parentId: ID | null;
  role:
    | "all"
    | "archive"
    | "drafts"
    | "flagged"
    | "important"
    | "inbox"
    | "junk"
    | "sent"
    | "subscribed"
    | "trash"
    | null;
  sortOrder: number;
  totalEmails: number;
  unreadEmails: number;
  totalThreads: number;
  unreadThreads: number;
  iSubscribed: boolean;
  myRights: {
    mayReadItems: boolean;
    mayAddItems: boolean;
    mayRemoveItems: boolean;
    maySetSeen: boolean;
    maySetKeywords: boolean;
    mayCreateChild: boolean;
    mayRename: boolean;
    mayDelete: boolean;
    maySubmit: boolean;
  };
};

/**
 * [rfc8621 § 2.3](https://datatracker.ietf.org/doc/html/rfc8621#section-2.3)
 */
export type MailboxFilterCondition = {
  parentId: ID | null;
  name: string;
  role: string | null;
  hasAnyRole: boolean;
  isSubscribed: boolean;
};

// =================================
// Threads
// =================================

/**
 * [rfc8621 § 3](https://datatracker.ietf.org/doc/html/rfc8621#section-3)
 */
export type Thread = {
  id: ID;
  emailIds: ID[];
};

// =================================
// Emails
// =================================

/**
 * [rfc8621 § 4](https://datatracker.ietf.org/doc/html/rfc8621#section-4)
 */
export type Email = EmailMetadataFields &
  EmailHeaderFields &
  EmailBodyPartFields;

/**
 * [rfc8621 § 4.1.1](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.1)
 */
type EmailMetadataFields = {
  id: ID;
  blobId: ID;
  threadId: ID;
  mailboxIds: Record<ID, boolean>;
  keywords: Record<Exclude<string, ForbiddenKeywordCharacters>, boolean>;
  size: number;
  receivedAt: string;
};

export type ForbiddenKeywordCharacters =
  | "("
  | ")"
  | "{"
  | "]"
  | "%"
  | "*"
  | '"'
  | "\\";

/**
 * [rfc8621 § 4.1.2.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.3)
 */
export type EmailAddress = {
  name: string | null;
  email: string;
};

/**
 * [rfc8621 § 4.1.2.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.4)
 */
export type EmailAddressGroup = {
  name: string | null;
  addresses: EmailAddress[];
};

/**
 * [rfc8621 § 4.1.2](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2)
 */
export type HeaderParsedForm = {
  Raw: string;
  Text: string;
  Addresses: EmailAddress[];
  GroupedAddresses: EmailAddressGroup[];
  MessageIds: string[] | null;
  Date: string | null;
  URLs: string[] | null;
};

/**
 * [rfc8621 § 4.1.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.3)
 */
export type HeaderFieldKey =
  | `header:${string}:as${keyof HeaderParsedForm}:all`
  | `header:${string}:as${keyof HeaderParsedForm}`
  | `header:${string}:all`
  | `header:${string}`;

export type GetValueFromHeaderKey<K extends HeaderFieldKey> =
  K extends `header:${string}:as${infer Form extends keyof HeaderParsedForm}:all`
    ? HeaderParsedForm[Form] extends Array<infer _>
      ? HeaderParsedForm[Form]
      : Array<HeaderParsedForm[Form]>
    : K extends `header:${string}:as${infer Form extends keyof HeaderParsedForm}`
    ? HeaderParsedForm[Form]
    : K extends `header:${string}:all`
    ? string[]
    : K extends `header:${infer Name extends string}`
    ? Name extends `:${string}` | `${string}:` | `:${string}:`
      ? never
      : string
    : never;

export type EmailHeader = {
  name: string;
  value: string;
};

type EmailHeaderFields = {
  headers: EmailHeader[];
  messageId: string[] | null;
  inReplyTo: string[] | null;
  references: string[] | null;
  sender: EmailAddress[] | null;
  from: EmailAddress[] | null;
  to: EmailAddress[] | null;
  cc: EmailAddress[] | null;
  bcc: EmailAddress[] | null;
  replyTo: EmailAddress[] | null;
  subject: string | null;
  sentAt: string | null;
};

/**
 * [rfc8621 § 4.1.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.4)
 */
type EmailBodyPartFields = {
  bodyStructure: EmailBodyPart;
  bodyValues: Record<ID, EmailBodyValue>;
  textBody: EmailBodyPart[];
  htmlBody: EmailBodyPart[];
  attachments: EmailBodyPart[];
  hasAttachment: boolean;
  preview: string;
};

export type EmailBodyPart = {
  partId: ID | null;
  blobId: ID | null;
  size: number;
  headers: EmailHeader[];
  name: string | null;
  type: string;
  charset: string | null;
  disposition: string | null;
  cid: string | null;
  language: string[] | null;
  location: string | null;
  subParts: EmailBodyPart[] | null;
};

export type EmailBodyValue = {
  value: string;
  isEncodingProblem: boolean;
  isTruncated: boolean;
};

/**
 * [rfc8621 § 4.4.1](https://datatracker.ietf.org/doc/html/rfc8621#section-4.4.1)
 */
export type EmailFilterCondition = FilterCondition<{
  inMailbox: ID;
  inMailboxOtherThan: ID[];
  before: UTCDate;
  after: UTCDate;
  minSize: number;
  maxSize: number;
  allInThreadHaveKeyword: string;
  someInThreadHaveKeyword: string;
  noneInThreadHaveKeyword: string;
  hasKeyword: string;
  notKeyword: string;
  hasAttachment: boolean;
  text: string;
  from: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  header: [string] | [string, string];
}>;

/**
 * [rfc8621 § 4.8](https://datatracker.ietf.org/doc/html/rfc8621#section-4.8)
 */
export type EmailImport = {
  blobId: ID;
  mailboxIds: Record<ID, boolean>;
  keywords: Record<Exclude<string, ForbiddenKeywordCharacters>, boolean>;
  receivedAt: UTCDate;
};

// =================================
// Search Snippets
// =================================

/**
 * [rfc8621 § 5](https://datatracker.ietf.org/doc/html/rfc8621#section-5)
 */
export type SearchSnippet = {
  emailId: ID;
  subject: string | null;
  preview: string | null;
};

// =================================
// Identities
// =================================

/**
 * [rfc8621 § 6](https://datatracker.ietf.org/doc/html/rfc8621#section-6)
 */
export type Identity = {
  id: ID;
  name: string;
  email: string;
  replyTo: EmailAddress[] | null;
  bcc: EmailAddress[] | null;
  textSignature: string;
  htmlSignature: string;
  mayDelete: boolean;
};

// =================================
// Email Submission
// =================================

/**
 * [rfc8621 § 7](https://datatracker.ietf.org/doc/html/rfc8621#section-7)
 */
export type EmailSubmission = {
  id: ID;
  identityId: ID;
  emailId: ID;
  threadId: ID;
  envelope: Envelope | null;
  sentAt: UTCDate;
  undoStatus: UndoStatus;
  deliveryStatus: Record<string, DeliveryStatus> | null;
  dsnBlobIds: ID[];
  mdnBlobIds: ID[];
};

export type Envelope = {
  mailFrom: EmailSubmissionAddress;
  rcptTo: EmailSubmissionAddress[];
};

export type EmailSubmissionAddress = {
  email: string;
  parameters: Record<string, unknown> | null;
};

export type DeliveryStatus = {
  smtpReply: string;
  delivered: "queued" | "yes" | "no" | "unknown";
  displayed: "yes" | "unknown";
};

export type EmailSubmissionFilterCondition = {
  identityIds: ID[];
  emailIds: ID[];
  threadIds: ID[];
  undoStatus: UndoStatus;
  before: UTCDate;
  after: UTCDate;
};

export type UndoStatus = "pending" | "final" | "canceled";

// =================================
// Vacation Response
// =================================

/**
 * [rfc8621 § 8](https://datatracker.ietf.org/doc/html/rfc8621#section-8)
 */
export type VacationResponse = {
  id: ID;
  isEnabled: boolean;
  fromDate: UTCDate | null;
  toDate: UTCDate | null;
  subject: string | null;
  textBody: string | null;
  htmlBody: string | null;
};
