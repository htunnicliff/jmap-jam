import type { Account } from "./account.ts";
import type { ID } from "./primitives.ts";

/**
 * [rfc8620 § 2](https://datatracker.ietf.org/doc/html/rfc8620#section-2)
 *
 * To ensure future compatibility, other properties MAY be included on
 * the Session object.  Clients MUST ignore any properties they are not
 * expecting.
 */
export interface Session<Capability extends string = string> {
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
}
