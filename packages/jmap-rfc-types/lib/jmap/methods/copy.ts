import type { Except } from "type-fest";
import type { ID, Obj } from "../primitives.ts";
import type { SetError } from "./set.ts";

/**
 * [rfc8620 § 5.4](https://datatracker.ietf.org/doc/html/rfc8620#section-5.4)
 */
export interface CopyArguments<T extends { id: ID }> {
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
  ifFromInState?: string;
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
  ifInState?: string;
  /**
   * A map of the *creation id* to a `T` object.  The `T` object MUST
   * contain an `id` property, which is the id (in the fromAccount) of
   * the record to be copied.  When creating the copy, any other
   * properties included are used instead of the current value for that
   * property on the original.
   */
  create: Record<ID, T>;
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
  destroyFromIfInState?: string;
}

export interface CopyResponse<T> {
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
}

export type CopySetError<T extends Obj = Obj> = Except<SetError<T>, "type"> & {
  type: SetError<T>["type"] | CopySetErrorType;
};

export enum CopySetErrorType {
  /**
   * The server forbids duplicates, and the record
   * already exists in the target account.  An `existingId` property of
   * type "Id" MUST be included on the SetError object with the id of the
   * existing record.
   */
  AlreadyExists = "alreadyExists"
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
  StateMismatch = "stateMismatch"
}
