export type Account<Capability extends string = string> = {
  /**
   * A user-friendly string to show when presenting content from
   * this account, e.g., the email address representing the owner of
   * the account.
   */
  name: string;
  /**
   * This is true if the account belongs to the authenticated user
   * rather than a group account or a personal account of another
   * user that has been shared with them.
   */
  isPersonal: boolean;
  /**
   * This is true if the entire account is read-only.
   */
  isReadOnly: boolean;
  /**
   * The set of capability URIs for the methods supported in this
   * account.  Each key is a URI for a capability that has methods
   * you can use with this account.  The value for each of these
   * keys is an object with further information about the account's
   * permissions and restrictions with respect to this capability,
   * as defined in the capability's specification.
   *
   * For example, you may have access to your own account with mail,
   * calendars, and contacts data and also a shared account that
   * only has contacts data (a business address book, for example).
   * In this case, the accountCapabilities property on the first
   * account would include something like
   * "urn:ietf:params:jmap:mail", "urn:ietf:params:jmap:calendars",
   * and "urn:ietf:params:jmap:contacts", while the second account
   * would just have the last of these.
   *
   * Attempts to use the methods defined in a capability with one of
   * the accounts that does not support that capability are rejected
   * with an "accountNotSupportedByMethod" error.
   */
  accountCapabilities: {
    [Key in Capability]: unknown;
  };
};
