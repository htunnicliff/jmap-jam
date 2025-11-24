import type { Except } from "type-fest";
import type { ID, Obj } from "../primitives.ts";
import type { SetError } from "../methods/set.ts";

/**
 * [rfc8620 § 6.3](https://datatracker.ietf.org/doc/html/rfc8620#section-6.3)
 */
export interface BlobCopyArguments {
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
}

export interface BlobCopyResponse {
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
}

export type BlobCopySetError<T extends Obj = Obj> = Except<
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
  FromAccountNotFound = "fromAccountNotFound"
}
