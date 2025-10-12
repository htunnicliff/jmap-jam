import type { RequireAtLeastOne } from "type-fest";
import type { CreationID, ID, Obj, PatchObject } from "../primitives.ts";

/**
 * [rfc8620 § 5.3](https://datatracker.ietf.org/doc/html/rfc8620#section-5.3)
 */
export type SetArguments<T extends object> = RequireAtLeastOne<
  {
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
    ifInState?: string;
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
    create?: Record<CreationID, RequireAtLeastOne<T>>;
    /**
     * A map of an id to a PatchObject to apply to the current `T`
     * object with that id, or null if no objects are to be updated.
     */
    update?: Record<ID, PatchObject<T>>;
    destroy?: ID[];
  },
  "create" | "update" | "destroy"
>;

export type SetResponse<T extends object, Args> =
  Args extends SetArguments<T>
    ? {
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
        created: Args["create"] extends object
          ? { [K in keyof Args["create"]]?: T }
          : null;
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
        updated: Args["update"] extends object
          ? { [K in keyof Args["update"]]?: T | null }
          : null;
        /**
         * A list of `T` ids for records that were successfully destroyed, or
         * null if none.
         */
        destroyed: Args["destroy"] extends string[] ? ID[] | null : null;
        /**
         * A map of the creation id to a SetError object for each record that
         * failed to be created, or null if all successful.
         */
        notCreated: Args["create"] extends object
          ? { [K in keyof Args["create"]]?: SetError } | null
          : null;
        /**
         * A map of the `T` id to a SetError object for each record that
         * failed to be updated, or null if all successful.
         */
        notUpdated: Args["update"] extends object
          ? { [K in keyof Args["update"]]?: SetError } | null
          : null;
        /**
         * A map of the `T` id to a SetError object for each record that
         * failed to be destroyed, or null if all successful.
         */
        notDestroyed: Args["destroy"] extends string[]
          ? Record<ID, SetError> | null
          : null;
      }
    : never;

export type SetError<T extends Obj = Obj> = {
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
  Singleton = "singleton"
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
  StateMismatch = "stateMismatch"
}
