import { FilterCondition, ID, UTCDate } from "../jmap";

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

export type Thread = {
  id: ID;
  emailIds: ID[];
};

// =================================
// Emails
// =================================

export type Email = {
  // Metadata
  id: ID;
  blobId: ID;
  threadId: ID;
  mailboxIds: Record<ID, boolean>;
  keywords: Record<Exclude<string, ForbiddenKeywordCharacters>, boolean>;
  size: number;
  receivedAt: string;
  // Header fields
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
  // Body parts
  bodyStructure: EmailBodyPart;
  bodyValues: Record<ID, EmailBodyValue>;
  textBody: EmailBodyPart[];
  htmlBody: EmailBodyPart[];
  attachments: EmailBodyPart[];
  hasAttachment: boolean;
  preview: string;
};

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

export type EmailHeader = {
  name: string;
  value: string;
};

export type EmailAddress = {
  name: string | null;
  email: string;
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

export type EmailImport = {
  blobId: ID;
  mailboxIds: Record<ID, boolean>;
  keywords: Record<Exclude<string, ForbiddenKeywordCharacters>, boolean>;
  receivedAt: UTCDate;
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

// =================================
// Search Snippets
// =================================

export type SearchSnippet = {
  emailId: ID;
  subject: string | null;
  preview: string | null;
};

// =================================
// Identities
// =================================

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

export type UndoStatus = "pending" | "final" | "canceled";

export type Envelope = {
  mailFrom: Address;
  rcptTo: Address[];
};

export type Address = {
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

// =================================
// Vacation Response
// =================================

export type VacationResponse = {
  id: ID;
  isEnabled: boolean;
  fromDate: UTCDate | null;
  toDate: UTCDate | null;
  subject: string | null;
  textBody: string | null;
  htmlBody: string | null;
};
