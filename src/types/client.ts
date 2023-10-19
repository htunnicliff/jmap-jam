import {
  BlobCopyArguments,
  BlobCopyResponse,
  ChangesArguments,
  ChangesResponse,
  CopyArguments,
  CopyResponse,
  FilterCondition,
  FilterOperator,
  GetArguments,
  GetResponse,
  ID,
  QueryArguments,
  QueryChangesArguments,
  QueryChangesResponse,
  QueryResponse,
  SetArguments,
  SetError,
  SetResponse,
} from "./jmap";
import {
  Email,
  EmailFilterCondition,
  EmailImport,
  EmailSubmission,
  EmailSubmissionFilterCondition,
  Identity,
  Mailbox,
  MailboxFilterCondition,
  SearchSnippet,
  Thread,
  VacationResponse,
} from "./jmap-mail/entities";
import { HasAllKeysOfRelated } from "./utilities";

export type Requests = {
  // Core -----------------------------------
  "Core/echo": Record<string, any>;
  // Blob -----------------------------------
  "Blob/copy": BlobCopyArguments;
  // Push Subscription ----------------------
  "PushSubscription/get": Omit<GetArguments<PushSubscription>, "accountId">;
  "PushSubscription/set": Omit<
    SetArguments<PushSubscription>,
    "accountId" | "ifInState"
  >;
  // Mailbox --------------------------------
  "Mailbox/get": GetArguments<Mailbox>;
  "Mailbox/changes": ChangesArguments;
  "Mailbox/query": QueryArguments<Mailbox, MailboxFilterCondition> & {
    sortAsTree?: boolean;
    filterAsTree?: boolean;
  };
  "Mailbox/queryChanges": QueryChangesArguments<
    Mailbox,
    MailboxFilterCondition
  >;
  "Mailbox/set": SetArguments<Mailbox> & {
    onDestroyRemoveEmails?: boolean;
  };
  // Thread ---------------------------------
  "Thread/get": GetArguments<Thread>;
  "Thread/changes": ChangesArguments;
  // Email ----------------------------------
  "Email/get": GetArguments<Email> & {
    bodyProperties?: Array<keyof Email>;
    fetchTextBodyValues?: boolean;
    fetchHTMLBodyValues?: boolean;
    fetchAllBodyValues?: boolean;
    maxBodyValueBytes?: number;
    // TODO: Headers?
  };
  "Email/changes": ChangesArguments;
  "Email/query": QueryArguments<Email, EmailFilterCondition> & {
    collapseThreads?: boolean;
  };
  "Email/queryChanges": QueryChangesArguments<Email, EmailFilterCondition> & {
    collapseThreads?: boolean;
  };
  "Email/set": SetArguments<Omit<Email, "headers">>;
  "Email/copy": CopyArguments<
    Pick<Email, "id" | "mailboxIds" | "keywords" | "receivedAt">
  >;
  "Email/import": {
    accountId: ID;
    ifInState?: string | null;
    emails: Record<ID, EmailImport>;
  };
  "Email/parse": {
    accountId: ID;
    blobIds: ID[];
    properties?: Array<keyof Email>;
    bodyProperties?: Array<keyof Email>;
    fetchTextBodyValues?: boolean;
    fetchHTMLBodyValues?: boolean;
    fetchAllBodyValues?: boolean;
    maxBodyValueBytes?: number;
  };
  // Search Snippet -------------------------
  "SearchSnippet/get": {
    accountId: ID;
    filter?:
      | FilterOperator<EmailFilterCondition>
      | FilterCondition<EmailFilterCondition>
      | null;
    emailIds: ID[];
  };
  // Identity -------------------------------
  "Identity/get": GetArguments<Identity>;
  "Identity/changes": ChangesArguments;
  "Identity/set": SetArguments<Identity>;
  // Email Submission -----------------------
  "EmailSubmission/get": GetArguments<EmailSubmission>;
  "EmailSubmission/changes": ChangesArguments;
  "EmailSubmission/query": QueryArguments<
    EmailSubmission,
    EmailSubmissionFilterCondition
  >;
  "EmailSubmission/queryChanges": QueryChangesArguments<
    EmailSubmission,
    EmailSubmissionFilterCondition
  >;
  "EmailSubmission/set": SetArguments<EmailSubmission> & {
    onSuccessUpdateEmail?: Record<ID, Partial<Email>> | null;
    onSuccessDestroyEmail?: ID[] | null;
  };
  // Vacation Response ----------------------
  "VacationResponse/get": GetArguments<VacationResponse>;
  "VacationResponse/set": SetArguments<VacationResponse>;
};

export type RequestsTuple<R> = {
  [Method in keyof R]: [Method, R[Method]];
}[keyof R];

export type Responses<A> = HasAllKeysOfRelated<
  Requests,
  {
    // Core -----------------------------------
    "Core/echo": A;
    // Blob -----------------------------------
    "Blob/copy": BlobCopyResponse;
    // Push Subscription ----------------------
    "PushSubscription/get": Omit<
      GetResponse<PushSubscription, A>,
      "state" | "accountId"
    >;
    "PushSubscription/set": Omit<
      SetResponse<PushSubscription>,
      "accountId" | "oldState" | "newState"
    >;
    // Mailbox --------------------------------
    "Mailbox/get": GetResponse<Mailbox, A>;
    "Mailbox/changes": ChangesResponse & {
      updatedProperties: Array<keyof Mailbox> | null;
    };
    "Mailbox/query": QueryResponse;
    "Mailbox/queryChanges": QueryChangesResponse;
    "Mailbox/set": SetResponse<Mailbox>;
    // Thread ---------------------------------
    "Thread/get": GetResponse<Thread, A>;
    "Thread/changes": ChangesResponse;
    // Email ----------------------------------
    "Email/get": GetResponse<Email, A>;
    "Email/changes": ChangesResponse;
    "Email/query": QueryResponse;
    "Email/queryChanges": QueryChangesResponse;
    "Email/set": SetResponse<Email>;
    "Email/copy": CopyResponse<Email>;
    "Email/import": {
      accountId: ID;
      oldState: string | null;
      newState: string;
      created: Record<ID, Email> | null;
      notCreated: Record<ID, SetError> | null;
    };
    "Email/parse": {
      accountId: ID;
      parsed: Record<ID, Email> | null;
      notParsable: ID[] | null;
      notFound: ID[] | null;
    };
    // Search Snippet -------------------------
    "SearchSnippet/get": {
      accountId: ID;
      list: SearchSnippet[];
      notFound: ID[] | null;
    };
    // Identity -------------------------------
    "Identity/get": GetResponse<Identity, A>;
    "Identity/changes": ChangesResponse;
    "Identity/set": SetResponse<Identity>;
    // Email Submission -----------------------
    "EmailSubmission/get": GetResponse<EmailSubmission, A>;
    "EmailSubmission/changes": ChangesResponse;
    "EmailSubmission/query": QueryResponse;
    "EmailSubmission/queryChanges": QueryChangesResponse;
    "EmailSubmission/set": SetResponse<EmailSubmission>;
    // Vacation Response ----------------------
    "VacationResponse/get": GetResponse<VacationResponse, A>;
    "VacationResponse/set": SetResponse<VacationResponse>;
  }
>;
