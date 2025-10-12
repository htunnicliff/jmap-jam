import type {
  Comparator,
  FilterCondition,
  FilterOperator
} from "../filters.ts";
import type { ID, Obj } from "../primitives.ts";

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
  filter?: FilterOperator<Filter> | FilterCondition<Filter>;
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
  sort?: ReadonlyArray<Comparator<T>>;
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
  anchor?: string;
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
  limit?: number;
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
  UnsupportedFilter = "unsupportedFilter"
}
