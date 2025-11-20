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
 * An arbitrary string defined by the client, used to identify created records
 */
export type CreationID = string;

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
export type PatchObject<T> = Partial<T> | { [K in ExtendedJSONPointer]: any };

/** @private */
export type Obj = Record<string, unknown>;
