import { Except } from "type-fest";
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
 *
 * All record ids are assigned by the server and are immutable.
 *
 * Where "Id" is given as a data type, it means a "String" of at least 1
 * and a maximum of 255 octets in size, and it MUST only contain
 * characters from the "URL and Filename Safe" base64 alphabet, as
 * defined in Section 5 of [RFC4648], excluding the pad character ("=").
 * This means the allowed characters are the ASCII alphanumeric
 * characters ("A-Za-z0-9"), hyphen ("-"), and underscore ("_").
 */
export type ID = string;

/**
 * [rfc8620 § 1.4](https://datatracker.ietf.org/doc/html/rfc8620#section-1.4)
 *
 * Where "Date" is given as a type, it means a string in "date-time"
 * format [RFC3339].  To ensure a normalised form, the "time-secfrac"
 * MUST always be omitted if zero, and any letters in the string (e.g.,
 * "T" and "Z") MUST be uppercase.  For example,
 * "2014-10-30T14:12:00+08:00".
 */
export type Date = string;

/**
 * [rfc8620 § 1.4](https://datatracker.ietf.org/doc/html/rfc8620#section-1.4)
 *
 * Where "UTCDate" is given as a type, it means a "Date" where the
 * "time-offset" component MUST be "Z" (i.e., it must be in UTC time).
 * For example, "2014-10-30T06:12:00Z".
 */
export type UTCDate = string;

/**
 * [rfc6901](https://datatracker.ietf.org/doc/html/rfc6901)
 *
 * This is a JSON Pointer as described in [RFC6901], except
 * it also allows the use of `*` to map through an array.
 */
export type ExtendedJSONPointer = `/${string}`;

/**
 * [rfc8620 § 2](https://datatracker.ietf.org/doc/html/rfc8620#section-2)
 *
 * To ensure future compatibility, other properties MAY be included on
 * the Session object.  Clients MUST ignore any properties they are not
 * expecting.
 */
export type Session<Capability extends string = string> = {
  /**
   * An object specifying the capabilities of this server.  Each key is
   * a URI for a capability supported by the server.  The value for
   * each of these keys is an object with further information about the
   * server's capabilities in relation to that capability.
   */
  capabilities: {
    [Key in Capability]: unknown;
  };
  /**
   * A map of an account id to an Account object for each account
   * the user has access to.
   */
  accounts: {
    [id: ID]: Account<Capability>;
  };
  /**
   * A map of capability URIs (as found in accountCapabilities) to the
   * account id that is considered to be the user's main or default
   * account for data pertaining to that capability.  If no account
   * being returned belongs to the user, or in any other way there is
   * no appropriate way to determine a default account, there MAY be no
   * entry for a particular URI, even though that capability is
   * supported by the server (and in the capabilities object).
   * "urn:ietf:params:jmap:core" SHOULD NOT be present.
   */
  primaryAccounts: {
    [Key in Capability]: ID;
  };
  /**
   * The username associated with the given credentials, or the empty
   * string if none.
   */
  username: string;
  /**
   * The URL to use for JMAP API requests.
   */
  apiUrl: string;
  /**
   * The URL endpoint to use when downloading files, in URI Template
   * (level 1) format [RFC6570].  The URL MUST contain variables called
   * `accountId`, `blobId`, `type`, and `name`.  The use of these
   * variables is described in Section 6.2.  Due to potential encoding
   * issues with slashes in content types, it is RECOMMENDED to put the
   * "type" variable in the query section of the URL.
   */
  downloadUrl: string;
  /**
   * The URL endpoint to use when uploading files, in URI Template
   * (level 1) format [RFC6570].  The URL MUST contain a variable
   * called "accountId".  The use of this variable is described in
   * Section 6.1.
   */
  uploadUrl: string;
  /**
   * The URL to connect to for push events, as described in
   * Section 7.3, in URI Template (level 1) format [RFC6570].  The URL
   * MUST contain variables called "types", "closeafter", and "ping".
   * The use of these variables is described in Section 7.3.
   */
  eventSourceUrl: string;
  /**
   *  A (preferably short) string representing the state of this object
   * on the server.  If the value of any other property on the Session
   * object changes, this string will change.  The current value is
   * also returned on the API Response object (see Section 3.4),
   * allowing clients to quickly determine if the session information
   * has changed (e.g., an account has been added or removed), so they
   * need to refetch the object.
   */
  state: string;
  [key: string]: unknown;
};

export type Account<Capability extends string = string> = {
  /**
   * A user-friendly string to show when presenting content from
   * this account, e.g., the email address representing the owner of
   * the account.
   */
  name: string;
  /**
   * This is true if the account belongs to the authenticated user
   * rather than a group account or a personal account of another
   * user that has been shared with them.
   */
  isPersonal: boolean;
  /**
   * This is true if the entire account is read-only.
   */
  isReadOnly: boolean;
  /**
   * The set of capability URIs for the methods supported in this
   * account.  Each key is a URI for a capability that has methods
   * you can use with this account.  The value for each of these
   * keys is an object with further information about the account's
   * permissions and restrictions with respect to this capability,
   * as defined in the capability's specification.
   *
   * For example, you may have access to your own account with mail,
   * calendars, and contacts data and also a shared account that
   * only has contacts data (a business address book, for example).
   * In this case, the accountCapabilities property on the first
   * account would include something like
   * "urn:ietf:params:jmap:mail", "urn:ietf:params:jmap:calendars",
   * and "urn:ietf:params:jmap:contacts", while the second account
   * would just have the last of these.
   *
   * Attempts to use the methods defined in a capability with one of
   * the accounts that does not support that capability are rejected
   * with an "accountNotSupportedByMethod" error.
   */
  accountCapabilities: {
    [Key in Capability]: unknown;
  };
};

// =================================
// Data Exchange
// =================================

/**
 * [rfc8620 § 3.2](https://datatracker.ietf.org/doc/html/rfc8620#section-3.2)
 *
 * Method calls and responses are represented by the `Invocation` data
 * type.  This is a tuple, represented as a JSON array containing three
 * elements:
 *
 *   1. A "String" *name* of the method to call or of the response.
 *
 *   2. A "String[*]" object containing named *arguments* for that method
 *      or response.
 *
 *   3. A "String" *method call id*: an arbitrary string from the client
 *      to be echoed back with the responses emitted by that method call
 *      (a method may return 1 or more responses, as it may make implicit
 *      calls to other methods; all responses initiated by this method
 *      call get the same method call id in the response).
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
  /**
   * The set of capabilities the client wishes to use.  The client MAY
   * include capability identifiers even if the method calls it makes
   * do not utilise those capabilities.  The server advertises the set
   * of specifications it supports in the Session object (see
   * Section 2), as keys on the "capabilities" property.
   */
  using: Capability[];
  /**
   * An array of method calls to process on the server.  The method
   * calls MUST be processed sequentially, in order.
   */
  methodCalls: T;
  /**
   * A map of a (client-specified) creation id to the id the server
   * assigned when a record was successfully created.
   *
   * As described later in this specification, some records may have a
   * property that contains the id of another record.  To allow more
   * efficient network usage, you can set this property to reference a
   * record created earlier in the same API request.  Since the real id
   * is unknown when the request is created, the client can instead
   * specify the creation id it assigned, prefixed with a "#" (see
   * Section 5.3 for more details).
   *
   * As the server processes API requests, any time it successfully
   * creates a new record, it adds the creation id to this map (see the
   * "create" argument to /set in Section 5.3), with the server-
   * assigned real id as the value.  If it comes across a reference to
   * a creation id in a create/update, it looks it up in the map and
   * replaces the reference with the real id, if found.
   *
   * The client can pass an initial value for this map as the
   * `createdIds` property of the Request object.  This may be an empty
   * object.  If given in the request, the response will also include a
   * createdIds property.  This allows proxy servers to easily split a
   * JMAP request into multiple JMAP requests to send to different
   * servers.  For example, it could send the first two method calls to
   * server A, then the third to server B, before sending the fourth to
   * server A again.  By passing the createdIds of the previous
   * response to the next request, it can ensure all of these still
   * resolve.  See Section 5.8 for further discussion of proxy
   * considerations.
   */
  createdIds?: Record<ID, string>;
};

/**
 * [rfc8620 § 3.4](https://datatracker.ietf.org/doc/html/rfc8620#section-3.4)
 */
export type Response<T extends Invocation[] = Invocation[]> = {
  /**
   * An array of responses, in the same format as the `methodCalls` on
   * the Request object.  The output of the methods MUST be added to
   * the `methodResponses` array in the same order that the methods are
   * processed.
   */
  methodResponses: T;
  /**
   * A map of a (client-specified) creation id to the id the server
   * assigned when a record was successfully created.  This MUST
   * include all creation ids passed in the original createdIds
   * parameter of the Request object, as well as any additional ones
   * added for newly created records.
   */
  createdIds?: Record<ID, string>;
  /**
   * The current value of the "state" string on the Session object, as
   * described in Section 2.  Clients may use this to detect if this
   * object has changed and needs to be refetched.
   */
  sessionState: string;
};

/**
 * [rfc8620 § 3.7](https://datatracker.ietf.org/doc/html/rfc8620#section-3.7)
 *
 * To allow clients to make more efficient use of the network and avoid
 * round trips, an argument to one method can be taken from the result
 * of a previous method call in the same request.
 *
 * To do this, the client prefixes the argument name with `#` (an
 * octothorpe).  The value is a ResultReference object as described
 * below.  When processing a method call, the server MUST first check
 * the arguments object for any names beginning with `#`.  If found, the
 * result reference should be resolved and the value used as the "real"
 * argument.  The method is then processed as normal.  If any result
 * reference fails to resolve, the whole method MUST be rejected with an
 * `invalidResultReference` error.  If an arguments object contains the
 * same argument name in normal and referenced form (e.g., `foo` and
 * `#foo`), the method MUST return an `invalidArguments` error.
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
   * also allows the use of `*` to map through an array.
   */
  path: ExtendedJSONPointer;
};

// =================================
// Errors
// =================================

/**
 * [rfc8620 § 3.6.1](https://datatracker.ietf.org/doc/html/rfc8620#section-3.6.1)
 */
export enum RequestErrorProblemType {
  /**
   * The client included a capability in the `using` property of the
   * request that the server does not support.
   */
  UnknownCapability = "urn:ietf:params:jmap:error:unknownCapability",
  /**
   * The content type of the request was not "application/json" or the
   * request did not parse as I-JSON.
   */
  NotJSON = "urn:ietf:params:jmap:error:notJSON",
  /**
   * The request parsed as JSON but did not match the type signature of
   * the Request object.
   */
  NotRequest = "urn:ietf:params:jmap:error:notRequest",
  /**
   * The request was not processed as it would have exceeded one of the
   * request limits defined on the capability object, such as
   * maxSizeRequest, maxCallsInRequest, or maxConcurrentRequests.  A
   * "limit" property MUST also be present on the "problem details"
   * object, containing the name of the limit being applied.
   */
  Limit = "urn:ietf:params:jmap:error:limit",
}

/**
 * [rfc7807 § 3](https://datatracker.ietf.org/doc/html/rfc7807#section-3)
 */
export type ProblemDetails = {
  /**
   * A URI reference [RFC3986] that identifies the
   * problem type.  This specification encourages that, when
   * dereferenced, it provide human-readable documentation for the
   * problem type (e.g., using HTML [W3C.REC-html5-20141028]).  When
   * this member is not present, its value is assumed to be
   * "about:blank".
   */
  type: string | RequestErrorProblemType;
  /**
   * The HTTP status code ([RFC7231], Section 6)
   * generated by the origin server for this occurrence of the problem.
   */
  status?: number;
  /**
   * A human-readable explanation specific to this
   * occurrence of the problem.
   */
  detail?: string;
  /**
   * A URI reference that identifies the specific
   * occurrence of the problem.  It may or may not yield further
   * information if dereferenced.
   */
  instance?: string;
  methodCallId?: string;
  limit?: string;
};

/**
 * [rfc8620 § 3.6.2](https://datatracker.ietf.org/doc/html/rfc8620#section-3.6.2)
 *
 * If a method encounters an error, the appropriate "error" response
 * MUST be inserted at the current point in the `methodResponses` array
 * and, unless otherwise specified, further processing MUST NOT happen
 * within that method call.
 *
 * Any further method calls in the request MUST then be processed as
 * normal.  Errors at the method level MUST NOT generate an HTTP-level
 * error.
 *
 * Further possible errors for a particular method are specified in the
 * method descriptions.
 *
 * Further general errors MAY be defined in future RFCs.  Should a
 * client receive an error type it does not understand, it MUST treat it
 * the same as the `serverFail` type.
 */
export enum MethodErrorType {
  /**
   * Some internal server resource was temporarily
   * unavailable.  Attempting the same operation later (perhaps after a
   * backoff with a random factor) may succeed.
   */
  ServerUnavailable = "serverUnavailable",
  /**
   * An unexpected or unknown error occurred during the
   * processing of the call.  A `description` property should provide more
   * details about the error.  The method call made no changes to the
   * server's state.  Attempting the same operation again is expected to
   * fail again.  Contacting the service administrator is likely necessary
   * to resolve this problem if it is persistent.
   */
  ServerFail = "serverFail",
  /**
   * Some, but not all, expected changes described by
   * the method occurred.  The client MUST resynchronise impacted data to
   * determine server state.  Use of this error is strongly discouraged.
   */
  ServerPartialFail = "serverPartialFail",
  /**
   * The server does not recognise this method name.
   */
  UnknownMethod = "unknownMethod",
  /**
   * One of the arguments is of the wrong type or is
   * otherwise invalid, or a required argument is missing.  A
   * "description" property MAY be present to help debug with an
   * explanation of what the problem was.  This is a non-localised string,
   * and it is not intended to be shown directly to end users.
   */
  InvalidArguments = "invalidArguments",
  /**
   * The method used a result reference for one of its arguments
   * (see Section 3.7), but this failed to resolve.
   */
  InvalidResultReference = "invalidResultReference",
  /**
   * The method and arguments are valid, but executing the
   * method would violate an Access Control List (ACL) or other
   * permissions policy.
   */
  Forbidden = "forbidden",
  /**
   * The accountId does not correspond to a valid account.
   */
  AccountNotFound = "accountNotFound",
  /**
   * The accountId given corresponds to a valid account, but
   * the account does not support this method or data type.
   */
  AccountNotSupportedByMethod = "accountNotSupportedByMethod",
  /**
   * This method modifies state, but the account is read-only
   * (as returned on the corresponding Account object in the
   * JMAP Session resource).
   */
  AccountReadOnly = "accountReadOnly",
}

// =================================
// Method Calls
// =================================

/**
 * [rfc8620 § 5.1](https://datatracker.ietf.org/doc/html/rfc8620#section-5.1)
 */
export type GetArguments<T> = {
  /**
   * The id of the account to use.
   */
  accountId: ID;
  /**
   * The ids of the `T` objects to return.  If null, then *all* records
   * of the data type are returned, if this is supported for that data
   * type and the number of records does not exceed the
   * `maxObjectsInGet` limit.
   */
  ids?: ReadonlyArray<ID> | null;
  /**
   *  If supplied, only the properties listed in the array are returned
   * for each `T` object.  If null, all properties of the object are
   * returned.  The id property of the object is *always* returned,
   * even if not explicitly requested.  If an invalid property is
   * requested, the call MUST be rejected with an "invalidArguments"
   * error.
   */
  properties?: ReadonlyArray<keyof T> | null;
};

export type GetResponse<T, Args> = Args extends GetArguments<T>
  ? {
      /**
       * The id of the account used for the call.
       */
      accountId: ID;
      /**
       * A (preferably short) string representing the state on the server
       * for *all* the data of this type in the account (not just the
       * objects returned in this call).  If the data changes, this string
       * MUST change.  If the `T` data is unchanged, servers SHOULD return
       * the same state string on subsequent requests for this data type.
       * When a client receives a response with a different state string to
       * a previous call, it MUST either throw away all currently cached
       * objects for the type or call "T/changes" to get the exact
       * changes.
       */
      state: string;
      /**
       * An array of the `T` objects requested.  This is the *empty array*
       * if no objects were found or if the `ids` argument passed in was
       * also an empty array.  The results MAY be in a different order to
       * the `ids` in the request arguments.  If an identical id is
       * included more than once in the request, the server MUST only
       * include it once in either the `list` or the `notFound` argument of
       * the response.
       */
      list: ReadonlyArray<
        Args["properties"] extends Array<infer P extends keyof T>
          ? Pick<T, P>
          : T
      >;
      /**
       * This array contains the ids passed to the method for records that
       * do not exist.  The array is empty if all requested ids were found
       * or if the `ids` argument passed in was either null or an empty
       * array.
       */
      notFound: ReadonlyArray<ID>;
    }
  : never;

export enum GetRequestErrorType {
  /**
   * The number of ids requested by the client exceeds
   * the maximum number the server is willing to process in a single
   * method call.
   */
  RequestTooLarge = "requestTooLarge",
}

/**
 * [rfc8620 § 5.2](https://datatracker.ietf.org/doc/html/rfc8620#section-5.2)
 */
export type ChangesArguments = {
  /**
   *  The id of the account to use.
   */
  accountId: ID;
  /**
   * The current state of the client.  This is the string that was
   * returned as the "state" argument in the "Foo/get" response.  The
   * server will return the changes that have occurred since this
   * state.
   */
  sinceState: string;
  /**
   * The maximum number of ids to return in the response.  The server
   * MAY choose to return fewer than this value but MUST NOT return
   * more.  If not given by the client, the server may choose how many
   * to return.  If supplied by the client, the value MUST be a
   * positive integer greater than 0.  If a value outside of this range
   * is given, the server MUST reject the call with an
   * `invalidArguments` error.
   */
  maxChanges: number | null;
};

export type ChangesResponse = {
  /**
   * The id of the account used for the call.
   */
  accountId: ID;
  /**
   * This is the `sinceState` argument echoed back; it's the state from
   * which the server is returning changes.
   */
  oldState: string;
  /**
   * This is the state the client will be in after applying the set of
   * changes to the old state.
   */
  newState: string;
  /**
   * If true, the client may call `T/changes` again with the
   * `newState` returned to get further updates.  If false, `newState`
   * is the current server state.
   */
  hasMoreChanges: boolean;
  /**
   * An array of ids for records that have been created since the old
   * state.
   */
  created: ID[];
  /**
   * An array of ids for records that have been updated since the old
   * state.
   */
  updated: ID[];
  /**
   * An array of ids for records that have been destroyed since the old
   * state.
   */
  destroyed: ID[];
};

export enum ChangesRequestErrorType {
  /**
   * The server cannot calculate the changes
   * from the state string given by the client.  Usually, this is due to
   * the client's state being too old or the server being unable to
   * produce an update to an intermediate state when there are too many
   * updates.  The client MUST invalidate its `T` cache.
   */
  CannotCalculateChanges = "cannotCalculateChanges",
}

/**
 * [rfc8620 § 5.3](https://datatracker.ietf.org/doc/html/rfc8620#section-5.3)
 */
export type SetArguments<T> = {
  /**
   * The id of the account to use.
   */
  accountId: ID;
  /**
   * This is a state string as returned by the "T/get" method
   * (representing the state of all objects of this type in the
   * account).  If supplied, the string must match the current state;
   * otherwise, the method will be aborted and a "stateMismatch" error
   * returned.  If null, any changes will be applied to the current
   * state.
   */
  ifInState: string | null;
  /**
   * A map of a *creation id* (a temporary id set by the client) to `T`
   * objects, or null if no objects are to be created.
   *
   * The `T` object type definition may define default values for
   * properties.  Any such property may be omitted by the client.
   *
   * The client MUST omit any properties that may only be set by the
   * server (for example, the `id` property on most object types).
   */
  create: Record<ID, T> | null;
  /**
   * A map of an id to a PatchObject to apply to the current `T`
   * object with that id, or null if no objects are to be updated.
   */
  update: PatchObject<T> | null;
  destroy: ID[] | null;
};

/**
 * A *PatchObject* is of type "String[*]" and represents an unordered
 * set of patches.  The keys are a path in JSON Pointer format
 * [RFC6901], with an implicit leading "/" (i.e., prefix each key
 * with "/" before applying the JSON Pointer evaluation algorithm).
 *
 * This patch definition is designed such that an entire `T` object
 * is also a valid PatchObject.  The client may choose to optimise
 * network usage by just sending the diff or may send the whole
 * object; the server processes it the same either way.
 *
 * TODO: Support more correct types for PatchObject
 */
export type PatchObject<T> = {
  [key in ExtendedJSONPointer | keyof T]: Partial<T>;
};

export type SetResponse<T> = {
  /**
   * The id of the account used for the call.
   */
  accountId: ID;
  /**
   * The state string that would have been returned by "T/get" before
   * making the requested changes, or null if the server doesn't know
   * what the previous state string was.
   */
  oldState: string | null;
  /**
   * The state string that will now be returned by "T/get".
   */
  newState: string;
  /**
   * A map of the creation id to an object containing any properties of
   * the created `T` object that were not sent by the client.  This
   * includes all server-set properties (such as the `id` in most
   * object types) and any properties that were omitted by the client
   * and thus set to a default by the server.
   *
   * This argument is null if no `T` objects were successfully created.
   */
  created: Record<ID, T> | null;
  /**
   * The keys in this map are the ids of all `T` objects that were
   * successfully updated.
   *
   * The value for each id is a `T` object containing any property that
   * changed in a way *not* explicitly requested by the PatchObject
   * sent to the server, or null if none.  This lets the client know of
   * any changes to server-set or computed properties.
   *
   * This argument is null if no `T` objects were successfully updated.
   */
  updated: Record<ID, T | null> | null;
  /**
   * A list of `T` ids for records that were successfully destroyed, or
   * null if none.
   */
  destroyed: ID[] | null;
  /**
   * A map of the creation id to a SetError object for each record that
   * failed to be created, or null if all successful.
   */
  notCreated: Record<ID, SetError> | null;
  /**
   * A map of the `T` id to a SetError object for each record that
   * failed to be updated, or null if all successful.
   */
  notUpdated: Record<ID, SetError> | null;
  /**
   * A map of the `T` id to a SetError object for each record that
   * failed to be destroyed, or null if all successful.
   */
  notDestroyed: Record<ID, SetError> | null;
};

export type SetError<T extends Obj = {}> = {
  /**
   * The type of error.
   */
  type: string | SetErrorType;
  /**
   * A description of the error to help with debugging that includes an
   * explanation of what the problem was.  This is a non-localised
   * string and is not intended to be shown directly to end users.
   */
  description: string | null;
  properties?: ReadonlyArray<keyof T>;
  existingId?: ID;
};

/**
 * The following SetError types are defined and may be returned for set
   operations on any record type where appropriate.

 * Other possible SetError types MAY be given in specific method
 * descriptions.  Other properties MAY also be present on the SetError
 * object, as described in the relevant methods.
 */
export enum SetErrorType {
  /**
   * (create; update; destroy).  The create/update/destroy
   * would violate an ACL or other permissions policy.
   */
  Forbidden = "forbidden",
  /**
   * (create; update).  The create would exceed a server-defined
   * limit on the number or total size of objects of this type.
   */
  OverQuota = "overQuota",
  /**
   * (create; update).  The create/update would result in
   * an object that exceeds a server-defined limit for the maximum size
   * of a single object of this type.
   */
  TooLarge = "tooLarge",
  /**
   * (create).  Too many objects of this type have been
   * created recently, and a server-defined rate limit has been
   * reached.  It may work if tried again later.
   */
  RateLimit = "rateLimit",
  /**
   * (update; destroy).  The id given to update/destroy
   * cannot be found.
   */
  NotFound = "notFound",
  /**
   * (update).  The PatchObject given to update the
   * record was not a valid patch (see the patch description).
   */
  InvalidPatch = "invalidPatch",
  /**
   * (update).  The client requested that an object be
   * both updated and destroyed in the same /set request, and the
   * server has decided to therefore ignore the update.
   */
  WillDestroy = "willDestroy",
  /**
   * (create; update).  The record given is
   * invalid in some way.  For example:
   *
   *   - It contains properties that are invalid according to the type
   *     specification of this record type.
   *
   *   - It contains a property that may only be set by the server
   *     (e.g., `id`) and is different to the current value.  Note, to
   *     allow clients to pass whole objects back, it is not an error to
   *     include a server-set property in an update as long as the value
   *     is identical to the current value on the server.
   *
   *   - There is a reference to another record (foreign key), and the
   *     given id does not correspond to a valid record.
   *
   * The SetError object SHOULD also have a property called
   * `properties` of type "String[]" that lists *all* the properties
   * that were invalid.
   *
   * Individual methods MAY specify more specific errors for certain
   * conditions that would otherwise result in an invalidProperties
   * error.  If the condition of one of these is met, it MUST be
   * returned instead of the invalidProperties error.
   */
  InvalidProperties = "invalidProperties",
  /**
   * (create; destroy).  This is a singleton type, so you
   * cannot create another one or destroy the existing one.
   */
  Singleton = "singleton",
}

export enum SetRequestErrorType {
  /**
   * The total number of objects to create, update, or
   * destroy exceeds the maximum number the server is willing to process
   * in a single method call.
   */
  RequestTooLarge = "requestTooLarge",
  /**
   * An `ifInState` argument was supplied, and it does
   * not match the current state.
   */
  StateMismatch = "stateMismatch",
}

/**
 * [rfc8620 § 5.4](https://datatracker.ietf.org/doc/html/rfc8620#section-5.4)
 */
export type CopyArguments<T extends { id: ID }> = {
  /**
   * The id of the account to copy records from.
   */
  fromAccountId: ID;
  /**
   * This is a state string as returned by the "T/get" method.  If
   * supplied, the string must match the current state of the account
   * referenced by the `fromAccountId` when reading the data to be
   * copied; otherwise, the method will be aborted and a
   * `stateMismatch` error returned.  If null, the data will be read
   * from the current state.
   */
  ifFromInState: string | null;
  /**
   * The id of the account to copy records to.  This MUST be different
   * to the `fromAccountId`.
   */
  accountId: ID;
  /**
   * This is a state string as returned by the "T/get" method.  If
   * supplied, the string must match the current state of the account
   * referenced by the accountId; otherwise, the method will be aborted
   * and a `stateMismatch` error returned.  If null, any changes will
   * be applied to the current state.
   */
  ifInState: string | null;
  /**
   * A map of the *creation id* to a `T` object.  The `T` object MUST
   * contain an `id` property, which is the id (in the fromAccount) of
   * the record to be copied.  When creating the copy, any other
   * properties included are used instead of the current value for that
   * property on the original.
   */
  create: Record<ID, T> | null;
  /**
   * If true, an attempt will be made to destroy the original records
   * that were successfully copied: after emitting the "T/copy"
   * response, but before processing the next method, the server MUST
   * make a single call to "T/set" to destroy the original of each
   * successfully copied record; the output of this is added to the
   * responses as normal, to be returned to the client.
   */
  onSuccessDestroyOriginal?: boolean;
  /**
   * This argument is passed on as the `ifInState` argument to the
   * implicit "T/set" call, if made at the end of this request to
   * destroy the originals that were successfully copied.
   */
  destroyFromIfInState: string | null;
};

export type CopyResponse<T> = {
  /**
   * The id of the account records were copied from.
   */
  fromAccountId: ID;
  /**
   * The id of the account records were copied to.
   */
  accountId: ID;
  /**
   * The state string that would have been returned by "T/get" on the
   * account records that were copied to before making the requested
   * changes, or null if the server doesn't know what the previous
   * state string was.
   */
  oldState: string | null;
  /**
   * The state string that will now be returned by "T/get" on the
   * account records were copied to
   */
  newState: string;
  /**
   * A map of the creation id to an object containing any properties of
   * the copied `T` object that are set by the server (such as the `id`
   * in most object types; note, the id is likely to be different to
   * the id of the object in the account it was copied from).
   *
   * This argument is null if no `T` objects were successfully copied.
   */
  created: Record<ID, T> | null;
  /**
   * A map of the creation id to a SetError object for each record that
   * failed to be copied, or null if none.
   */
  notCreated: Record<ID, CopySetError> | null;
};

export type CopySetError<T extends Obj = {}> = Except<SetError<T>, "type"> & {
  type: SetError<T>["type"] | CopySetErrorType;
};

export enum CopySetErrorType {
  /**
   * The server forbids duplicates, and the record
   * already exists in the target account.  An `existingId` property of
   * type "Id" MUST be included on the SetError object with the id of the
   * existing record.
   */
  AlreadyExists = "alreadyExists",
}

export enum CopyRequestErrorType {
  /**
   * The `fromAccountId` does not correspond to a
   * valid account.
   */
  FromAccountNotFound = "fromAccountNotFound",
  /**
   * The `fromAccountId` given
   * corresponds to a valid account, but the account does not support this
   * data type.
   */
  FromAccountNotSupportedByMethod = "fromAccountNotSupportedByMethod",
  /**
   * An `ifInState` argument was supplied and it does not
   * match the current state, or an `ifFromInState` argument was supplied
   * and it does not match the current state in the from account.
   */
  StateMismatch = "stateMismatch",
}

/**
 * [rfc8620 § 5.5](https://datatracker.ietf.org/doc/html/rfc8620#section-5.5)
 */
export type QueryArguments<T extends Obj, Filter extends Obj = T> = {
  /**
   * The id of the account to use.
   */
  accountId: ID;
  /**
   * Determines the set of T objects returned in the results.  If null, all
   * objects in the account of this type are included in the results.
   */
  filter?: FilterOperator<Filter> | FilterCondition<Filter> | null;
  /**
   * Lists the names of properties to compare between two `T` records,
   * and how to compare them, to determine which comes first in the
   * sort.  If two `T` records have an identical value for the first
   * comparator, the next comparator will be considered, and so on.  If
   * all comparators are the same (this includes the case where an
   * empty array or null is given as the "sort" argument), the sort
   * order is server dependent, but it MUST be stable between calls to
   * "T/query".
   */
  sort?: ReadonlyArray<Comparator<T>> | null;
  /**
   * The zero-based index of the first id in the full list of results
   * to return.
   *
   * If a negative value is given, it is an offset from the end of the
   * list.  Specifically, the negative value MUST be added to the total
   * number of results given the filter, and if still negative, it's
   * clamped to `0`.  This is now the zero-based index of the first id
   * to return.
   *
   * If the index is greater than or equal to the total number of
   * objects in the results list, then the `ids` array in the response
   * will be empty, but this is not an error.
   */
  position?: number;
  /**
   * A `T` id.  If supplied, the `position` argument is ignored.  The
   * index of this id in the results will be used in combination with
   * the `anchorOffset` argument to determine the index of the first
   * result to return
   */
  anchor?: string | null;
  /**
   * The index of the first result to return relative to the index of
   * the anchor, if an anchor is given.  This MAY be negative.  For
   * example, `-1` means the `T` immediately preceding the anchor is
   * the first result in the list returned.
   */
  anchorOffset?: number;
  /**
   * The maximum number of results to return.  If null, no limit
   * presumed.  The server MAY choose to enforce a maximum `limit`
   * argument.  In this case, if a greater value is given (or if it is
   * null), the limit is clamped to the maximum; the new limit is
   * returned with the response so the client is aware.  If a negative
   * value is given, the call MUST be rejected with an
   * `invalidArguments` error.
   */
  limit?: number | null;
  /**
   * Does the client wish to know the total number of results in the
   * query?  This may be slow and expensive for servers to calculate,
   * particularly with complex filters, so clients should take care to
   * only request the total when needed.
   */
  calculateTotal?: boolean;
};

export type QueryResponse = {
  /**
   * The id of the account used for the call.
   */
  accountId: ID;
  /**
   * A string encoding the current state of the query on the server.
   * This string MUST change if the results of the query (i.e., the
   * matching ids and their sort order) have changed.  The queryState
   * string MAY change if something has changed on the server, which
   * means the results may have changed but the server doesn't know for
   * sure.
   *
   * The queryState string only represents the ordered list of ids that
   * match the particular query (including its sort/filter).  There is
   * no requirement for it to change if a property on an object
   * matching the query changes but the query results are unaffected
   * (indeed, it is more efficient if the queryState string does not
   * change in this case).  The queryState string only has meaning when
   * compared to future responses to a query with the same type/sort/
   * filter or when used with /queryChanges to fetch changes.
   *
   * Should a client receive back a response with a different
   * queryState string to a previous call, it MUST either throw away
   * the currently cached query and fetch it again (note, this does not
   * require fetching the records again, just the list of ids) or call
   * "T/queryChanges" to get the difference.
   */
  queryState: string;
  /**
   * This is true if the server supports calling "T/queryChanges"
   * with these "filter"/"sort" parameters.  Note, this does not
   * guarantee that the "T/queryChanges" call will succeed, as it may
   * only be possible for a limited time afterwards due to server
   * internal implementation details.
   */
  canCalculateChanges: boolean;
  /**
   * The zero-based index of the first result in the "ids" array within
   * the complete list of query results.
   */
  position: number;
  /**
   * The list of ids for each `T` in the query results, starting at the
   * index given by the `position` argument of this response and
   * continuing until it hits the end of the results or reaches the
   * `limit` number of ids.  If `position >= total`, this MUST be
   * the empty list.
   */
  ids: ID[];
  /**
   * The total number of `T` objects in the results (given the `filter`).
   * This argument MUST be omitted if the "calculateTotal" request
   * argument is not true.
   */
  total?: number;
  /**
   * The limit enforced by the server on the maximum number of results
   * to return.  This is only returned if the server set a limit or
   * used a different limit than that given in the request.
   */
  limit?: number;
};

export enum QueryRequestErrorType {
  /**
   * An anchor argument was supplied, but it cannot be
   * found in the results of the query.
   */
  AnchorNotFound = "anchorNotFound",
  /**
   * The `sort` is syntactically valid, but it includes
   * a property the server does not support sorting on or a collation
   * method it does not recognise
   */
  UnsupportedSort = "unsupportedSort",
  /**
   * The `filter` is syntactically valid, but the
   * server cannot process it.  If the filter was the result of a user's
   * search input, the client SHOULD suggest that the user simplify their
   * search.
   */
  UnsupportedFilter = "unsupportedFilter",
}

/**
 * [rfc8620 § 5.6](https://datatracker.ietf.org/doc/html/rfc8620#section-5.6)
 */
export type QueryChangesArguments<T extends Obj, Filter extends Obj> = {
  /**
   * The id of the account to use.
   */
  accountId: ID;
  /**
   * The filter argument that was used with "T/query".
   */
  filter: FilterOperator<Filter> | FilterCondition<Filter> | null;
  /**
   * The sort argument that was used with "T/query".
   */
  sort: ReadonlyArray<Comparator<T>> | null;
  /**
   * The current state of the query in the client.  This is the string
   * that was returned as the `queryState` argument in the "T/query"
   * response with the same sort/filter.  The server will return the
   * changes made to the query since this state.
   */
  sinceQueryState: string;
  /**
   * The maximum number of changes to return in the response.  See
   * error descriptions below for more details.
   */
  maxChanges: number | null;
  /**
   * The last (highest-index) id the client currently has cached from
   * the query results.  When there are a large number of results, in a
   * common case, the client may have only downloaded and cached a
   * small subset from the beginning of the results.  If the sort and
   * filter are both only on immutable properties, this allows the
   * server to omit changes after this point in the results, which can
   * significantly increase efficiency.  If they are not immutable,
   * this argument is ignored.
   */
  upToId: ID | null;
  /**
   * Does the client wish to know the total number of results now in
   * the query?  This may be slow and expensive for servers to
   * calculate, particularly with complex filters, so clients should
   * take care to only request the total when needed.
   */
  calculateTotal?: boolean;
};

export type QueryChangesResponse = {
  /**
   * The id of the account used for the call.
   */
  accountId: ID;
  /**
   * This is the `sinceQueryState` argument echoed back; that is, the
   * state from which the server is returning changes.
   */
  oldQueryState: string;
  /**
   * This is the state the query will be in after applying the set of
   * changes to the old state.
   */
  newQueryState: string;
  /**
   * The total number of `T` objects in the results (given the `filter`).
   */
  total?: number;
  /**
   * The `id` for every T that was in the query results in the old
   * state and that is not in the results in the new state.
   *
   * If the server cannot calculate this exactly, the server MAY return
   * the ids of extra T objects in addition that may have been in the old
   * results but are not in the new results.
   *
   * If the sort and filter are both only on immutable properties and
   * an `upToId` is supplied and exists in the results, any ids that
   * were removed but have a higher index than `upToId` SHOULD be
   * omitted.
   *
   * If the `filter` or `sort` includes a mutable property, the server
   * MUST include all T objects in the current results for which this
   * property may have changed.  The position of these may have moved
   * in the results, so they must be reinserted by the client to ensure
   * its query cache is correct.
   */
  removed: string[];
  /**
   * The id and index in the query results (in the new state) for every
   * T that has been added to the results since the old state AND
   * every T in the current results that was included in the
   * `removed` array (due to a filter or sort based upon a mutable
   * property).
   */
  added: ReadonlyArray<QueryChangesAddedItem>;
};

export enum QueryChangesRequestErrorType {
  /**
   * There are more changes than the client's
   * `maxChanges` argument.  Each item in the removed or added array is
   * considered to be one change.  The client may retry with higher max
   * changes or invalidate its cache of the query results.
   */
  TooManyChanges = "tooManyChanges",
  /**
   * The server cannot calculate the changes
   * from the queryState string given by the client, usually due to the
   * client's state being too old.  The client MUST invalidate its cache
   * of the query results.
   */
  CannotCalculateChanges = "cannotCalculateChanges",
}

export type QueryChangesAddedItem = {
  id: ID;
  index: number;
};

// =================================
// Filters
// =================================

export type FilterOperator<Filter extends Obj> = {
  operator: FilterOperatorType | `${FilterOperatorType}`;
  conditions: ReadonlyArray<FilterOperator<Filter> | FilterCondition<Filter>>;
};

export enum FilterOperatorType {
  /**
   * All of the conditions must match for the filter to match.
   */
  And = "AND",
  /**
   * At least one of the conditions must match for the filter to match.
   */
  Or = "OR",
  /**
   * None of the conditions must match for the filter to match.
   */
  Not = "NOT",
}

export type FilterCondition<Filter extends Obj> = Except<
  Partial<Filter>,
  "operator"
>;

/**
 * Lists the names of properties to compare between two T records,
 * and how to compare them, to determine which comes first in a
 * sort.
 */
export type Comparator<T extends Obj> = {
  /**
   * The name of the property on the `T` objects to compare.
   */
  property: keyof T;
  /**
   * If true, sort in ascending order.  If false, reverse the
   * comparator's results to sort in descending order.
   */
  isAscending?: boolean;
  /**
   * The identifier, as registered in the collation registry defined
   * in [RFC4790], for the algorithm to use when comparing the order
   * of strings.  The algorithms the server supports are advertised
   * in the capabilities object returned with the Session object
   * (see Section 2).
   *
   * If omitted, the default algorithm is server dependent,
   */
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
  /**
   * The id of the account used for the call.
   */
  accountId: ID;
  /**
   * The id representing the binary data uploaded.  The data for this
   * id is immutable.  The id *only* refers to the binary data, not any
   * metadata.
   */
  blobId: ID;
  /**
   * The media type of the file (as specified in [RFC6838],
   * Section 4.2) as set in the Content-Type header of the upload HTTP
   * request.
   */
  type: string;
  /**
   *  The size of the file in octets.
   */
  size: number;
};

/**
 * [rfc8620 § 6.2](https://datatracker.ietf.org/doc/html/rfc8620#section-6.2)
 */
export type BlobDownloadParams = {
  /**
   * The id of the account to which the record with the `blobId` belongs
   */
  accountId: ID;
  /**
   * The blobId representing the data of the file to download.
   */
  blobId: ID;
  /**
   * The type for the server to set in the "Content-Type"
   * header of the response; the `blobId` only represents the binary data
   * and does not have a content-type innately associated with it.
   */
  type: string;
  /**
   * The name for the file; the server MUST return this as the
   * filename if it sets a "Content-Disposition" header.
   */
  name: string;
};

/**
 * [rfc8620 § 6.3](https://datatracker.ietf.org/doc/html/rfc8620#section-6.3)
 */
export type BlobCopyArguments = {
  /**
   * The id of the account to copy blobs from.
   */
  fromAccountId: ID;
  /**
   * The id of the account to copy blobs to.
   */
  accountId: ID;
  /**
   *  A list of ids of blobs to copy to the other account.
   */
  blobIds: ID[];
};

export type BlobCopyResponse = {
  /**
   * The id of the account blobs were copied from.
   */
  fromAccountId: ID;
  /**
   * The id of the account blobs were copied to.
   */
  accountId: ID;
  /**
   * A map of the `blobId` in the `fromAccount` to the id for the blob in
   * the account it was copied to, or null if none were successfully
   * copied.
   */
  copied: Record<ID, ID> | null;
  /**
   * A map of `blobId` to a SetError object for each blob that failed to
   * be copied, or null if none.
   */
  notCopied: Record<ID, BlobCopySetError> | null;
};

export type BlobCopySetError<T extends Obj = {}> = Except<
  SetError<T>,
  "type"
> & {
  type: SetError<T>["type"] | BlobCopySetErrorType;
};

export enum BlobCopySetErrorType {
  /**
   * The `fromAccountId` included with the request
   * does not correspond to a valid account.
   */
  FromAccountNotFound = "fromAccountNotFound",
}

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
  /**
   * The id of the push subscription.
   */
  id: ID;
  /**
   * An id that uniquely identifies the client + device it is running
   * on.  The purpose of this is to allow clients to identify which
   * PushSubscription objects they created even if they lose their
   * local state, so they can revoke or update them.  This string MUST
   * be different on different devices and be different from apps from
   * other vendors.  It SHOULD be easy to regenerate and not depend on
   * persisted state.  It is RECOMMENDED to use a secure hash of a
   * string that contains:
   *
   *   1. A unique identifier associated with the device where the JMAP
   *      client is running, normally supplied by the device's operating
   *      system.
   *
   *   2. A custom vendor/app id, including a domain controlled by the
   *      vendor of the JMAP client.
   *
   * To protect the privacy of the user, the `deviceClientId` id MUST NOT
   * contain an unobfuscated device id.
   */
  deviceClientId: string;
  /**
   * An absolute URL where the JMAP server will POST the data for the
   * push message.  This MUST begin with `https://`.
   */
  url: string;
  /**
   * Client-generated encryption keys.  If supplied, the server MUST
   * use them as specified in [RFC8291] to encrypt all data sent to the
   * push subscription.
   */
  keys?: null | {
    /**
     * The P-256 Elliptic Curve Diffie-Hellman (ECDH) public key as
     * described in [RFC8291], encoded in URL-safe base64
     * representation as defined in [RFC4648].
     */
    p256dh: string;
    /**
     * The authentication secret as described in [RFC8291], encoded in
     * URL-safe base64 representation as defined in [RFC4648].
     */
    auth: string;
  };
  /**
   * This MUST be null (or omitted) when the subscription is created.
   * The JMAP server then generates a verification code and sends it in
   * a push message, and the client updates the PushSubscription object
   * with the code; see Section 7.2.2 for details.
   */
  verificationCode?: string | null;
  /**
   * The time this push subscription expires.  If specified, the JMAP
   * server MUST NOT make further requests to this resource after this
   * time.  It MAY automatically destroy the push subscription at or
   * after this time.
   *
   * The server MAY choose to set an expiry if none is given by the
   * client or modify the expiry time given by the client to a shorter
   * duration.
   */
  expires?: UTCDate | null;
  /**
   * A list of types the client is interested in (using the same names
   * as the keys in the TypeState object defined in the previous
   * section).  A StateChange notification will only be sent if the
   * data for one of these types changes.  Other types are omitted from
   * the TypeState object.  If null, changes will be pushed for all
   * types.
   */
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
  /**
   * The `types` argument MUST be either:
   *
   *   - A comma-separated list of type names, e.g.,
   *     `Email,CalendarEvent`.  The server MUST only push changes for
   *     the types in this list.
   *
   *   - The single character: `*`.  Changes to all types are pushed.
   */
  types: "*" | string;
  closeafter: EventSourceCloseAfterType | `${EventSourceCloseAfterType}`;
  /**
   * A positive integer value representing a length of time in
   * seconds, e.g., `300`.  If non-zero, the server MUST send an event
   * called `ping` whenever this time elapses since the previous event
   * was sent.  This MUST NOT set a new event id.  If the value is `0`,
   * the server MUST NOT send ping events.
   *
   * The server MAY modify a requested ping interval to be subject to a
   * minimum and/or maximum value.  For interoperability, servers MUST
   * NOT have a minimum allowed value higher than 30 or a maximum
   * allowed value less than 300.
   *
   * The data for the ping event MUST be a JSON object containing an
   * `interval` property, the value (type "UnsignedInt") being the
   * interval in seconds the server is using to send pings (this may be
   * different to the requested value if the server clamped it to be
   * within a min/max value).
   *
   * Clients can monitor for the ping event to help determine when the
   * closeafter mode may be required.
   */
  ping: string;
};

export enum EventSourceCloseAfterType {
  /**
   * The server MUST end the HTTP response after pushing a
   * state event.  This can be used by clients in environments where
   * buffering proxies prevent the pushed data from arriving
   * immediately, or indeed at all, when operating in the usual
   * mode.
   */
  State = "state",
  /**
   * The connection is persisted by the server as a standard
   * event-source resource.
   */
  No = "no",
}
