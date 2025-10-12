import type { ExtendedJSONPointer, ID } from "./primitives.ts";

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
