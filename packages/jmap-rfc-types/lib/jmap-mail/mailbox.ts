import type { ID } from "../jmap/primitives.ts";

/**
 * [rfc8621 § 2](https://datatracker.ietf.org/doc/html/rfc8621#section-2)
 *
 * A Mailbox represents a named set of Email objects. This is the
 * primary mechanism for organising messages within an account. It is
 * analogous to a folder or a label in other systems.
 */
export interface Mailbox {
  /**
   * The id of the Mailbox
   *
   * @kind immutable
   * @kind server-set
   */
  id: ID;
  /**
   * User-visible name for the Mailbox, e.g., "Inbox".
   */
  name: string;
  /**
   * The Mailbox id for the parent of this Mailbox, or null if this
   * Mailbox is at the top level. Mailboxes form acyclic graphs
   * (forests) directed by the child-to-parent relationship.
   */
  parentId: ID | null;
  /**
   * Identifies Mailboxes that have a particular common purpose (e.g.,
   * the "inbox"), regardless of the "name" property (which may be
   * localised).
   */
  role: MailboxRole | null;
  /**
   * Defines the sort order of Mailboxes when presented in the client's
   * UI, so it is consistent between devices. The number MUST be an
   * integer in the range 0 <= sortOrder < 2^31.
   */
  sortOrder: number;
  /**
   * The number of Emails in this Mailbox.
   *
   * @kind server-set
   */
  totalEmails: number;
  /**
   * The number of Emails in this Mailbox that have neither the "$seen"
   * keyword nor the "$draft" keyword.
   *
   * @kind server-set
   */
  unreadEmails: number;
  /**
   * The number of Threads where at least one Email in the Thread is in
   * this Mailbox.
   *
   * @kind server-set
   */
  totalThreads: number;
  /**
   * An indication of the number of "unread" Threads in the Mailbox.
   *
   * @kind server-set
   */
  unreadThreads: number;
  /**
   * Has the user indicated they wish to see this Mailbox in their
   * client?
   */
  isSubscribed: boolean;
  /**
   * The set of rights (Access Control Lists (ACLs)) the user has in
   * relation to this Mailbox.  These are backwards compatible with
   * IMAP ACLs, as defined in [rfc4314](https://datatracker.ietf.org/doc/html/rfc4314).
   *
   * @kind server-set
   */
  myRights: {
    /**
     * If true, the user may use this Mailbox as part of a filter in
     * an "Email/query" call, and the Mailbox may be included in the
     * "mailboxIds" property of Email objects.  Email objects may be
     * fetched if they are in *at least one* Mailbox with this
     * permission.  If a sub-Mailbox is shared but not the parent
     * Mailbox, this may be false.  Corresponds to IMAP ACLs "lr" (if
     * mapping from IMAP, both are required for this to be true).
     */
    mayReadItems: boolean;
    /**
     * The user may add mail to this Mailbox (by either creating a new
     * Email or moving an existing one). Corresponds to IMAP ACL "i".
     */
    mayAddItems: boolean;
    /**
     * The user may remove mail from this Mailbox (by either changing
     * the Mailboxes of an Email or destroying the Email).
     * Corresponds to IMAP ACLs "te" (if mapping from IMAP, both are
     * required for this to be true).
     */
    mayRemoveItems: boolean;
    /**
     * The user may add or remove the "$seen" keyword to/from an
     * Email. If an Email belongs to multiple Mailboxes, the user may
     * only modify "$seen" if they have this permission for *all* of
     * the Mailboxes.  Corresponds to IMAP ACL "s".
     */
    maySetSeen: boolean;
    /**
     * The user may add or remove any keyword other than "$seen" to/
     * from an Email.  If an Email belongs to multiple Mailboxes, the
     * user may only modify keywords if they have this permission for
     * *all* of the Mailboxes.  Corresponds to IMAP ACL "w".
     */
    maySetKeywords: boolean;
    /**
     * The user may create a Mailbox with this Mailbox as its parent.
     * Corresponds to IMAP ACL "k".
     */
    mayCreateChild: boolean;
    /**
     * The user may rename the Mailbox or make it a child of another
     * Mailbox.  Corresponds to IMAP ACL "x" (although this covers
     * both rename and delete permissions).
     */
    mayRename: boolean;
    /**
     * The user may delete the Mailbox itself.  Corresponds to IMAP
     * ACL "x" (although this covers both rename and delete
     * permissions).
     */
    mayDelete: boolean;
    /**
     * Messages may be submitted directly to this Mailbox.
     * Corresponds to IMAP ACL "p".
     */
    maySubmit: boolean;
  };
}

export type MailboxRole =
  | "all"
  | "archive"
  | "drafts"
  | "flagged"
  | "important"
  | "inbox"
  | "junk"
  | "sent"
  | "subscribed"
  | "trash";

export type MailboxCreate = Omit<
  Mailbox,
  // Fields set by server
  | "id"
  | "totalEmails"
  | "unreadEmails"
  | "totalThreads"
  | "unreadThreads"
  | "myRights"
>;

/**
 * [rfc8621 § 2.3](https://datatracker.ietf.org/doc/html/rfc8621#section-2.3)
 */
export interface MailboxFilterCondition {
  parentId: ID | null;
  name: string;
  role: MailboxRole | null;
  hasAnyRole: boolean;
  isSubscribed: boolean;
}
