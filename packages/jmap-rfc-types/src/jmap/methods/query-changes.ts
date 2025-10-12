import type {
  Comparator,
  FilterCondition,
  FilterOperator
} from "../filters.ts";
import type { ID, Obj } from "../primitives.ts";

/**
 * [rfc8620 § 5.6](https://datatracker.ietf.org/doc/html/rfc8620#section-5.6)
 */
export interface QueryChangesArguments<T extends Obj, Filter extends Obj> {
  /**
   * The id of the account to use.
   */
  accountId: ID;
  /**
   * The filter argument that was used with "T/query".
   */
  filter?: FilterOperator<Filter> | FilterCondition<Filter>;
  /**
   * The sort argument that was used with "T/query".
   */
  sort?: ReadonlyArray<Comparator<T>>;
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
  maxChanges?: number;
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
  upToId?: ID;
  /**
   * Does the client wish to know the total number of results now in
   * the query?  This may be slow and expensive for servers to
   * calculate, particularly with complex filters, so clients should
   * take care to only request the total when needed.
   */
  calculateTotal?: boolean;
}

export interface QueryChangesResponse {
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
}

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
  CannotCalculateChanges = "cannotCalculateChanges"
}

export interface QueryChangesAddedItem {
  id: ID;
  index: number;
}
