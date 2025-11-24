import type { ID } from "../primitives.ts";

/**
 * [rfc8620 § 5.1](https://datatracker.ietf.org/doc/html/rfc8620#section-5.1)
 */
export interface GetArguments<T> {
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
  ids?: ReadonlyArray<ID>;
  /**
   *  If supplied, only the properties listed in the array are returned
   * for each `T` object.  If null, all properties of the object are
   * returned.  The id property of the object is *always* returned,
   * even if not explicitly requested.  If an invalid property is
   * requested, the call MUST be rejected with an "invalidArguments"
   * error.
   */
  properties?: ReadonlyArray<keyof T>;
}

export type GetResponse<T, Args> =
  Args extends GetArguments<T>
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
  RequestTooLarge = "requestTooLarge"
}
