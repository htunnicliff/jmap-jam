import type { Obj } from "../helpers.ts";

/**
 * JMAP
 *
 * [rfc8620](https://datatracker.ietf.org/doc/html/rfc8620)
 */

// =================================
// Primitives
// =================================

/**
 * [rfc8620 § 1.2](https://datatracker.ietf.org/doc/html/rfc8620#section-1.2)
 */
export type ID = string;

/**
 * [rfc8620 § 1.4](https://datatracker.ietf.org/doc/html/rfc8620#section-1.4)
 * @example "2014-10-30T14:12:00+08:00"
 */
export type Date = string;

/**
 * [rfc8620 § 1.4](https://datatracker.ietf.org/doc/html/rfc8620#section-1.4)
 * @example "2014-10-30T06:12:00Z"
 */
export type UTCDate = string;

/**
 * [rfc6901](https://datatracker.ietf.org/doc/html/rfc6901)
 * @example "/a/b/c"
 */
export type JSONPointer = `/${string}`;

/**
 * [rfc8620 § 2](https://datatracker.ietf.org/doc/html/rfc8620#section-2)
 */
export type Session<Capability extends string = string> = {
  capabilities: {
    [Key in Capability]: unknown;
  };
  accounts: {
    [id: ID]: Account<Capability>;
  };
  primaryAccounts: {
    [Key in Capability]: ID;
  };
  username: string;
  apiUrl: string;
  downloadUrl: string;
  uploadUrl: string;
  eventSourceUrl: string;
  state: string;
  [key: string]: unknown;
};

export type Account<Capability extends string = string> = {
  name: string;
  isPersonal: boolean;
  isReadOnly: boolean;
  accountCapabilities: {
    [Key in Capability]: unknown;
  };
};

// =================================
// Data Exchange
// =================================

/**
 * [rfc8620 § 3.2](https://datatracker.ietf.org/doc/html/rfc8620#section-3.2)
 */
export type Invocation<T = unknown> = [
  name: string,
  argsOrResponse: T,
  methodCallId: string
];

/**
 * [rfc8620 § 3.3](https://datatracker.ietf.org/doc/html/rfc8620#section-3.3)
 */
export type Request<
  T extends Invocation[] = Invocation[],
  Capability extends string = string
> = {
  using: Capability[];
  methodCalls: T;
  createdIds?: Record<ID, string>;
};

/**
 * [rfc8620 § 3.4](https://datatracker.ietf.org/doc/html/rfc8620#section-3.4)
 */
export type Response<T extends Invocation[] = Invocation[]> = {
  methodResponses: T;
  createdIds?: Record<ID, string>;
  sessionState: string;
};

/**
 * [rfc8620 § 3.7](https://datatracker.ietf.org/doc/html/rfc8620#section-3.7)
 */
export type ResultReference = {
  /**
   * The method call id (see Section 3.2) of a previous method call in the current request.
   */
  resultOf: string;
  /**
   * The required name of a response to that method call.
   */
  name: string;
  /**
   * A pointer into the arguments of the response selected via the name and resultOf properties.
   * This is a JSON Pointer [rfc6901](https://datatracker.ietf.org/doc/html/rfc6901), except it
   * also allows the use of "*" to map through an array.
   */
  path: JSONPointer;
};

// =================================
// Errors
// =================================

/**
 * [rfc7807 § 3](https://datatracker.ietf.org/doc/html/rfc7807#section-3)
 */
export type ProblemDetails = {
  type: string;
  status?: number;
  detail?: string;
  instance?: string;
  methodCallId?: string;
};

export type SetError<T extends Obj = {}> = {
  type: string;
  description: string | null;
  properties?: ReadonlyArray<keyof T>;
  existingId?: ID;
};

// =================================
// Method Calls
// =================================

/**
 * [rfc8620 § 5.1](https://datatracker.ietf.org/doc/html/rfc8620#section-5.1)
 */
export type GetArguments<T> = {
  accountId: ID;
  ids?: ReadonlyArray<ID> | null;
  properties?: ReadonlyArray<keyof T> | null;
};

export type GetResponse<T, Args> = Args extends GetArguments<T>
  ? {
      accountId: ID;
      state: string;
      list: ReadonlyArray<
        Args["properties"] extends Array<infer P extends keyof T>
          ? Pick<T, P>
          : T
      >;
      notFound: ReadonlyArray<ID>;
    }
  : never;

/**
 * [rfc8620 § 5.2](https://datatracker.ietf.org/doc/html/rfc8620#section-5.2)
 */
export type ChangesArguments = {
  accountId: ID;
  sinceState: string;
  maxChanges: number | null;
};

export type ChangesResponse = {
  accountId: ID;
  oldState: string;
  newState: string;
  hasMoreChanges: boolean;
  created: ID[];
  updated: ID[];
  destroyed: ID[];
};

/**
 * [rfc8620 § 5.3](https://datatracker.ietf.org/doc/html/rfc8620#section-5.3)
 */
export type SetArguments<T> = {
  accountId: ID;
  ifInState: string | null;
  create: Record<ID, T> | null;
  update: Record<JSONPointer, Partial<T>> | null;
  destroy: ID[] | null;
};

export type SetResponse<T> = {
  accountId: ID;
  oldState: string;
  newState: string;
  created: Record<ID, T> | null;
  updated: Record<ID, T | null> | null;
  destroyed: ID[] | null;
  notCreated: Record<ID, SetError> | null;
  notUpdated: Record<ID, SetError> | null;
  notDestroyed: Record<ID, SetError> | null;
};

/**
 * [rfc8620 § 5.4](https://datatracker.ietf.org/doc/html/rfc8620#section-5.4)
 */
export type CopyArguments<T extends { id: ID }> = {
  fromAccountId: ID;
  ifFromInState: string | null;
  accountId: ID;
  ifInState: string | null;
  create: Record<ID, T> | null;
  onSuccessDestroyOriginal: boolean;
  destroyFromIfInState: string | null;
};

export type CopyResponse<T> = {
  fromAccountId: ID;
  accountId: ID;
  oldState: string | null;
  newState: string;
  created: Record<ID, T> | null;
  notCreated: Record<ID, SetError> | null;
};

/**
 * [rfc8620 § 5.5](https://datatracker.ietf.org/doc/html/rfc8620#section-5.5)
 */
export type QueryArguments<T extends Obj, Filter extends Obj = T> = {
  accountId: ID;
  filter?: FilterOperator<Filter> | FilterCondition<Filter> | null;
  sort?: ReadonlyArray<Comparator<T>> | null;
  position?: number;
  anchor?: string | null;
  anchorOffset?: number;
  limit?: number | null;
  calculateTotal?: boolean;
};

export type QueryResponse = {
  accountId: ID;
  queryState: string;
  canCalculateChanges: boolean;
  position: number;
  ids: ID[];
  total?: number;
  limit?: number;
};

/**
 * [rfc8620 § 5.6](https://datatracker.ietf.org/doc/html/rfc8620#section-5.6)
 */
export type QueryChangesArguments<T extends Obj, Filter extends Obj> = {
  accountId: ID;
  filter: FilterOperator<Filter> | FilterCondition<Filter> | null;
  sort: ReadonlyArray<Comparator<T>> | null;
  sinceQueryState: string;
  maxChanges: number | null;
  upToId: ID | null;
  calculateTotal?: boolean;
};

export type QueryChangesResponse = {
  accountId: ID;
  oldQueryState: string;
  newQueryState: string;
  total?: number;
  removed: string[];
  added: ReadonlyArray<{
    id: ID;
    index: number;
  }>;
  position: number;
};

// =================================
// Filters
// =================================

export type FilterOperator<Filter extends Obj> = {
  operator: "AND" | "OR" | "NOT";
  conditions: ReadonlyArray<FilterOperator<Filter> | FilterCondition<Filter>>;
};

export type FilterCondition<Filter extends Obj> = Partial<Filter>;

export type Comparator<T extends Obj> = {
  property: keyof T;
  isAscending?: boolean;
  collation?: string;
};

// =================================
// Binary Data
// =================================

/**
 * [rfc8620 § 6.1](https://datatracker.ietf.org/doc/html/rfc8620#section-6.1)
 */
export type BlobUploadParams = {
  accountId: ID;
};

export type BlobUploadResponse = {
  accountId: ID;
  blobId: ID;
  type: string;
  size: number;
};

/**
 * [rfc8620 § 6.2](https://datatracker.ietf.org/doc/html/rfc8620#section-6.2)
 */
export type BlobDownloadParams = {
  accountId: ID;
  blobId: ID;
  type: string;
  name: string;
};

/**
 * [rfc8620 § 6.3](https://datatracker.ietf.org/doc/html/rfc8620#section-6.3)
 */
export type BlobCopyArguments = {
  fromAccountId: ID;
  accountId: ID;
  blobIds: ID[];
};

export type BlobCopyResponse = {
  fromAccountId: ID;
  accountId: ID;
  copied: Record<ID, ID> | null;
  notCopied: Record<ID, SetError> | null;
};

// =================================
// Push
// =================================

/**
 * [rfc8620 § 7.1](https://datatracker.ietf.org/doc/html/rfc8620#section-7.1)
 */
export type StateChange = {
  "@type": "StateChange";
  changed: Record<ID, TypeState>;
};

export type TypeState = Record<string, string>;

/**
 * [rfc8620 § 7.2](https://datatracker.ietf.org/doc/html/rfc8620#section-7.2)
 */
export type PushSubscription = {
  id: ID;
  deviceClientId: string;
  url: string;
  keys?: null | {
    p256dh: string;
    auth: string;
  };
  verificationCode?: string | null;
  expires?: string | null;
  types?: string[] | null;
};

/**
 * [rfc8620 § 7.2.2](https://datatracker.ietf.org/doc/html/rfc8620#section-7.2.2)
 */
export type PushVerification = {
  "@type": "PushVerification";
  pushSubscriptionId: string;
  verificationCode: string;
};

/**
 * [rfc8620 § 7.3](https://datatracker.ietf.org/doc/html/rfc8620#section-7.3)
 */
export type EventSourceArguments = {
  types: "*" | string;
  closeafter: "state" | "no";
  ping: string;
};
