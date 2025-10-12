import type { ID } from "../primitives.ts";

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
  maxChanges?: number;
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
  CannotCalculateChanges = "cannotCalculateChanges"
}
