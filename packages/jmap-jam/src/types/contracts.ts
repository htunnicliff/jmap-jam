import type { Exact } from "type-fest";
import type { HasAllKeysOfRelated } from "../helpers.ts";
import type {
  Email,
  EmailBodyPart,
  EmailCreate,
  EmailFilterCondition,
  EmailImport,
  EmailSubmission,
  EmailSubmissionCreate,
  EmailSubmissionFilterCondition,
  GetValueFromHeaderKey,
  HeaderFieldKey,
  Identity,
  IdentityCreate,
  Mailbox,
  MailboxCreate,
  MailboxFilterCondition,
  SearchSnippet,
  Thread,
  VacationResponse,
  VacationResponseCreate
} from "./jmap-mail.ts";
import type {
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
  Request as JMAPRequest,
  Response as JMAPResponse,
  ProblemDetails,
  PushSubscription,
  PushSubscriptionCreate,
  QueryArguments,
  QueryChangesArguments,
  QueryChangesResponse,
  QueryResponse,
  SetArguments,
  SetError,
  SetResponse
} from "./jmap.ts";

export type Requests = {
  // Core -----------------------------------
  "Core/echo": Record<string, any>;
  // Blob -----------------------------------
  "Blob/copy": BlobCopyArguments;
  // Push Subscription ----------------------
  "PushSubscription/get": Omit<GetArguments<PushSubscription>, "accountId">;
  "PushSubscription/set": Omit<
    SetArguments<PushSubscriptionCreate>,
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
  "Mailbox/set": SetArguments<MailboxCreate> & {
    onDestroyRemoveEmails?: boolean;
  };
  // Thread ---------------------------------
  "Thread/get": GetArguments<Thread>;
  "Thread/changes": ChangesArguments;
  // Email ----------------------------------
  "Email/get": GetEmailArguments;
  "Email/changes": ChangesArguments;
  "Email/query": QueryArguments<Email, EmailFilterCondition> & {
    collapseThreads?: boolean;
  };
  "Email/queryChanges": QueryChangesArguments<Email, EmailFilterCondition> & {
    collapseThreads?: boolean;
  };
  "Email/set": SetArguments<EmailCreate>;
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
  "Identity/set": SetArguments<IdentityCreate>;
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
  "EmailSubmission/set": SetArguments<EmailSubmissionCreate> & {
    onSuccessUpdateEmail?: Record<ID, Partial<Email>> | null;
    onSuccessDestroyEmail?: ID[] | null;
  };
  // Vacation Response ----------------------
  "VacationResponse/get": GetArguments<VacationResponse>;
  "VacationResponse/set": SetArguments<VacationResponseCreate>;
};

export type Methods = keyof Requests;

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
      SetResponse<PushSubscription, A>,
      "accountId" | "oldState" | "newState"
    >;
    // Mailbox --------------------------------
    "Mailbox/get": GetResponse<Mailbox, A>;
    "Mailbox/changes": ChangesResponse & {
      updatedProperties: Array<keyof Mailbox> | null;
    };
    "Mailbox/query": QueryResponse;
    "Mailbox/queryChanges": QueryChangesResponse;
    "Mailbox/set": SetResponse<Mailbox, A>;
    // Thread ---------------------------------
    "Thread/get": GetResponse<Thread, A>;
    "Thread/changes": ChangesResponse;
    // Email ----------------------------------
    "Email/get": GetEmailResponse<A>;
    "Email/changes": ChangesResponse;
    "Email/query": QueryResponse;
    "Email/queryChanges": QueryChangesResponse;
    "Email/set": SetResponse<Email, A>;
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
    "Identity/set": SetResponse<Identity, A>;
    // Email Submission -----------------------
    "EmailSubmission/get": GetResponse<EmailSubmission, A>;
    "EmailSubmission/changes": ChangesResponse;
    "EmailSubmission/query": QueryResponse;
    "EmailSubmission/queryChanges": QueryChangesResponse;
    "EmailSubmission/set": SetResponse<EmailSubmission, A>;
    // Vacation Response ----------------------
    "VacationResponse/get": GetResponse<VacationResponse, A>;
    "VacationResponse/set": SetResponse<VacationResponse, A>;
  }
>;

/**
 * Get the arguments for a method.
 */
export type GetArgs<Method extends Methods, T> = Exact<Requests[Method], T>;

/**
 * Get the response data for a method with specific arguments.
 */
export type GetResponseData<
  Method extends Methods,
  Args
> = Responses<Args>[Method];

export type RequestOptions = {
  fetchInit?: RequestInit;
  using?: JMAPRequest["using"];
  createdIds?: JMAPRequest["createdIds"];
};

export type LocalInvocation<
  Method extends Methods,
  Args extends Exact<Requests[Method], Args>
> = [Method, Args];

export type Meta = {
  sessionState: JMAPResponse["sessionState"];
  createdIds: JMAPResponse["createdIds"];
  response: Response;
};

export type GetResult<
  Data,
  HandleErrors extends "throw" | "return"
> = HandleErrors extends "throw"
  ? Data
  :
      | {
          data: Data;
          error: null;
        }
      | {
          data: null;
          error: ProblemDetails;
        };

/**
 * This is an interface for a Proxy-based API that functions similarly to this example:
 *
 * @example
 * ```ts
 * const api = {
 *   Email: {
 *     get: (args) => jam.request(["Email/get", args]),
 *     changes: (args) => jam.request(["Email/changes", args]),
 *     // ...
 *   },
 *   Mailbox: {
 *     get: (args) => jam.request(["Mailbox/get", args]),
 *     query: (args) => jam.request(["Mailbox/query", args]),
 *     // ...
 *   },
 *   // ...
 * }
 * ```
 */
export type ProxyAPI = {
  [Entity in keyof Requests as Entity extends `${infer EntityName}/${string}`
    ? EntityName
    : never]: {
    [Method in Entity as Method extends `${string}/${infer MethodName}`
      ? MethodName
      : never]: <A extends Requests[Method]>(
      args: A
    ) => Promise<[Responses<A>[Method], Meta]>;
  };
};

export type GetEmailArguments = {
  accountId: ID;
  ids?: ReadonlyArray<ID> | null;
  properties?: ReadonlyArray<keyof Email | HeaderFieldKey> | null;
  bodyProperties?: Array<keyof EmailBodyPart>;
  fetchTextBodyValues?: boolean;
  fetchHTMLBodyValues?: boolean;
  fetchAllBodyValues?: boolean;
  maxBodyValueBytes?: number;
};

export type GetEmailResponse<Args> = Args extends GetEmailArguments
  ? {
      accountId: ID;
      state: string;
      list: ReadonlyArray<
        Args["properties"] extends Array<infer P extends string>
          ? {
              [Key in P]: Key extends HeaderFieldKey
                ? GetValueFromHeaderKey<Key>
                : Key extends keyof Email
                  ? Email[Key]
                  : never;
            }
          : Email
      >;
      notFound: ReadonlyArray<ID>;
    }
  : never;
