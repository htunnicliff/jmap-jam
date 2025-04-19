import type { FilterCondition, ID, UTCDate } from "./jmap.ts";

/**
 * JMAP Mail
 *
 * [rfc8621](https://datatracker.ietf.org/doc/html/rfc8621)
 */

export type Entities = {
  Mailbox: Mailbox;
  Thread: Thread;
  Email: Email;
  SearchSnippet: SearchSnippet;
  Identity: Identity;
  EmailSubmission: EmailSubmission;
  VacationResponse: VacationResponse;
};

export type Entity = keyof Entities;

// =================================
// Mailboxes
// =================================

/**
 * [rfc8621 § 2](https://datatracker.ietf.org/doc/html/rfc8621#section-2)
 *
 * A Mailbox represents a named set of Email objects. This is the
 * primary mechanism for organising messages within an account. It is
 * analogous to a folder or a label in other systems.
 */
export type Mailbox = {
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
  role:
    | "all"
    | "archive"
    | "drafts"
    | "flagged"
    | "important"
    | "inbox"
    | "junk"
    | "sent"
    | "subscribed"
    | "trash"
    | null;
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
};

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
export type MailboxFilterCondition = {
  parentId: ID | null;
  name: string;
  role: string | null;
  hasAnyRole: boolean;
  isSubscribed: boolean;
};

// =================================
// Threads
// =================================

/**
 * [rfc8621 § 3](https://datatracker.ietf.org/doc/html/rfc8621#section-3)
 *
 * Replies are grouped together with the original message to form a
 * Thread.  In JMAP, a Thread is simply a flat list of Emails, ordered
 * by date.
 */
export type Thread = {
  /**
   * The id of the Thread.
   *
   * @kind immutable
   * @kind server-set
   */
  id: ID;
  /**
   * The ids of the Emails in the Thread, sorted by the "receivedAt"
   * date of the Email, oldest first.  If two Emails have an identical
   * date, the sort is server dependent but MUST be stable (sorting by
   * id is recommended).
   *
   * @kind server-set
   */
  emailIds: ID[];
};

// =================================
// Emails
// =================================

/**
 * [rfc8621 § 4](https://datatracker.ietf.org/doc/html/rfc8621#section-4)
 *
 * An *Email* object is a representation of a message [rfc5322](https://datatracker.ietf.org/doc/html/rfc5322), which
 * allows clients to avoid the complexities of MIME parsing, transfer
 * encoding, and character encoding.
 */
export type Email = EmailMetadataFields &
  EmailHeaderFields &
  EmailBodyPartFields;

// TODO: Support exclusive patterns described in [rfc8621 § 4.6](https://datatracker.ietf.org/doc/html/rfc8621#section-4.6)
export type EmailCreate = Partial<
  Omit<
    Email,
    | "id"
    | "blobId"
    | "threadId"
    | "size"
    | "hasAttachment"
    | "preview"
    | "headers"
  >
>;

/**
 * [rfc8621 § 4.1.1](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.1)
 *
 * These properties represent metadata about the message in the mail
 * store and are not derived from parsing the message itself.
 */
type EmailMetadataFields = {
  /**
   * The id of the Email object.  Note that this is the JMAP object id,
   * NOT the Message-ID header field value of the message [rfc5322](https://datatracker.ietf.org/doc/html/rfc5322).
   *
   * @kind immutable
   * @kind server-set
   */
  id: ID;
  /**
   * The id representing the raw octets of the message [rfc5322](https://datatracker.ietf.org/doc/html/rfc5322) for
   * this Email.  This may be used to download the raw original message
   * or to attach it directly to another Email, etc.
   *
   * @kind immutable
   * @kind server-set
   */
  blobId: ID;
  /**
   * The id of the Thread to which this Email belongs.
   *
   * @kind immutable
   * @kind server-set
   */
  threadId: ID;
  /**
   * The set of Mailbox ids this Email belongs to.  An Email in the
   * mail store MUST belong to one or more Mailboxes at all times
   * (until it is destroyed).  The set is represented as an object,
   * with each key being a Mailbox id.  The value for each key in the
   * object MUST be true.
   */
  mailboxIds: Record<ID, boolean>;
  /**
   * A set of keywords that apply to the Email.  The set is represented
   * as an object, with the keys being the keywords.  The value for
   * each key in the object MUST be true.
   *
   * Keywords are shared with IMAP.  The six system keywords from IMAP
   * get special treatment.  The following four keywords have their
   * first character changed from `\` in IMAP to `$` in JMAP and have
   * particular semantic meaning:
   *
   * - `$draft`: The Email is a draft the user is composing.
   * - `$seen`: The Email has been read.
   * - `$flagged`: The Email has been flagged for urgent/special
   * attention.
   * - `$answered`: The Email has been replied to.
   *
   * The IMAP `\Recent` keyword is not exposed via JMAP.  The IMAP
   * `\Deleted` keyword is also not present: IMAP uses a delete+expunge
   * model, which JMAP does not.  Any message with the `\Deleted`
   * keyword MUST NOT be visible via JMAP (and so are not counted in
   * the `totalEmails`, `unreadEmails`, `totalThreads`, and
   * `unreadThreads` Mailbox properties).
   */
  keywords: Record<
    Exclude<string, ForbiddenKeywordCharacters> | JMAPKeyword,
    boolean
  >;
  /**
   * The size, in octets, of the raw data for the message [rfc5322](https://datatracker.ietf.org/doc/html/rfc5322) (as
   * referenced by the "blobId", i.e., the number of octets in the file
   * the user would download).
   *
   * @kind immutable
   * @kind server-set
   */
  size: number;
  /**
   * A UTC Date – The date the Email was received by the message store.  This is the
   * "internal date" in IMAP [rfc3501](https://datatracker.ietf.org/doc/html/rfc3501).
   *
   * @kind immutable
   */
  receivedAt: string;
};

/**
 *  The IANA "IMAP and JMAP Keywords" registry at
 * <https://www.iana.org/assignments/imap-jmap-keywords/> as
 * established in [rfc5788](https://datatracker.ietf.org/doc/html/rfc5788) assigns semantic meaning to some other
 * keywords in common use.  New keywords may be established here in
 * the future.
 */
export type JMAPKeyword =
  | "$draft"
  | "$seen"
  | "$flagged"
  | "$answered"
  | "$forwarded"
  | "$phishing"
  | "$junk"
  | "$notjunk";

export type ForbiddenKeywordCharacters =
  | "("
  | ")"
  | "{"
  | "]"
  | "%"
  | "*"
  | '"'
  | "\\";

/**
 * [rfc8621 § 4.1.2.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.3)
 */
export type EmailAddress = {
  name?: string;
  email: string;
};

/**
 * [rfc8621 § 4.1.2.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.4)
 */
export type EmailAddressGroup = {
  name?: string;
  addresses: EmailAddress[];
};

/**
 * [rfc8621 § 4.1.2](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2)
 *
 * Header field properties are derived from the message header fields
 * [rfc5322](https://datatracker.ietf.org/doc/html/rfc5322) [rfc6532](https://datatracker.ietf.org/doc/html/rfc6532).  All header fields may be fetched in a raw form.
 * Some header fields may also be fetched in a parsed form.  The
 * structured form that may be fetched depends on the header.
 */
export type HeaderParsedForm = {
  /**
   * [rfc8621 § 4.1.2.1](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.1)
   *
   * The raw octets of the header field value from the first octet
   * following the header field name terminating colon, up to but
   * excluding the header field terminating CRLF.  Any standards-compliant
   * message MUST be either [ASCII](https://datatracker.ietf.org/doc/html/rfc5322)
   * or [UTF-8](https://datatracker.ietf.org/doc/html/rfc6532); however,
   * other encodings exist in the wild.  A server SHOULD replace any octet
   * or octet run with the high bit set that violates UTF-8 syntax with
   * the unicode replacement character (U+FFFD).  Any NUL octet MUST be
   * dropped.
   *
   * This form will typically have a leading space, as most generated
   * messages insert a space after the colon that terminates the header
   * field name.
   */
  Raw: string;
  /**
   * [rfc8621 § 4.1.2.2](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.2)
   *
   * The header field value with:
   *
   *  1. White space unfolded (as defined in [rfc5322 § 2.2.3](https://datatracker.ietf.org/doc/html/rfc5322#section-2.2.3)).
   *
   *  2. The terminating CRLF at the end of the value removed.
   *
   *  3. Any SP characters at the beginning of the value removed.
   *
   *  4. Any syntactically correct encoded sections [RFC2047] with a known
   *     character set decoded.  Any NUL octets or control characters
   *     encoded per [RFC2047] are dropped from the decoded value.  Any
   *     text that looks like syntax per [RFC2047] but violates placement
   *     or white space rules per [RFC2047] MUST NOT be decoded.
   *
   *  5. The resulting unicode converted to Normalization Form C (NFC) form.
   */
  Text: string;
  /**
   * [rfc8621 § 4.1.2.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.3)
   */
  Addresses: EmailAddress[];
  /**
   * [rfc8621 § 4.1.2.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.4)
   */
  GroupedAddresses: EmailAddressGroup[];
  /**
   * [rfc8621 § 4.1.2.5](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.5)
   *
   * The header field is parsed as a list of "msg-id" values, as specified
   * in [RFC5322], Section 3.6.4, into the "String[]" type.  Comments and/
   * or folding white space (CFWS) and surrounding angle brackets ("<>")
   * are removed.  If parsing fails, the value is null.
   */
  MessageIds?: string[];
  /**
   * [rfc8621 § 4.1.2.6](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.6)
   */
  Date?: string;
  /**
   * [rfc8621 § 4.1.2.7](https://datatracker.ietf.org/doc/html/rfc8721#section-4.1.2.6)
   *
   * The header field is parsed as a list of URLs, as described in
   * [RFC2369], into the "String[]" type.  Values do not include the
   * surrounding angle brackets or any comments in the header field with
   * the URLs.  If parsing fails, the value is null.
   */
  URLs?: string[];
};

/**
 * [rfc8621 § 4.1.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.3)
 */
export type HeaderFieldKey =
  | `header:${string}:as${keyof HeaderParsedForm}:all`
  | `header:${string}:as${keyof HeaderParsedForm}`
  | `header:${string}:all`
  | `header:${string}`;

export type GetValueFromHeaderKey<K extends HeaderFieldKey> =
  K extends `header:${string}:as${infer Form extends keyof HeaderParsedForm}:all`
    ? HeaderParsedForm[Form] extends Array<infer _>
      ? HeaderParsedForm[Form]
      : Array<HeaderParsedForm[Form]>
    : K extends `header:${string}:as${infer Form extends keyof HeaderParsedForm}`
      ? HeaderParsedForm[Form]
      : K extends `header:${string}:all`
        ? string[]
        : K extends `header:${infer Name extends string}`
          ? Name extends `:${string}` | `${string}:` | `:${string}:`
            ? never
            : string
          : never;

/**
 * [rfc8621 § 4.1.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.3)
 */
export type EmailHeader = {
  /**
   * The header "field name" as defined in [RFC5322], with the same
   * capitalization that it has in the message.
   */
  name: string;
  /**
   * The header "field value" as defined in [RFC5322], in Raw form.
   */
  value: string;
};

/**
 * [rfc8621 § 4.1.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.3)
 *
 * @kind immutable
 */
type EmailHeaderFields = {
  /**
   * This is a list of all header fields [RFC5322], in the same order
   * they appear in the message.
   */
  headers: EmailHeader[];
  /**
   * The value is identical to the value of `header:Message-ID:asMessageIds`.
   * For messages conforming to RFC 5322, this will be an array with a single entry.
   */
  messageId?: string[];
  /**
   * The value is identical to the value of `header:In-Reply-To:asMessageIds`.
   */
  inReplyTo?: string[];
  /**
   * The value is identical to the value of `header:References:asMessageIds`.
   */
  references?: string[];
  /**
   * The value is identical to the value of `header:Sender:asAddresses`.
   */
  sender?: EmailAddress[];
  /**
   * The value is identical to the value of `header:From:asAddresses`.
   */
  from?: EmailAddress[];
  /**
   * The value is identical to the value of `header:To:asAddresses`.
   */
  to?: EmailAddress[];
  /**
   * The value is identical to the value of `header:Cc:asAddresses`.
   */
  cc?: EmailAddress[];
  /**
   * The value is identical to the value of `header:Bcc:asAddresses`.
   */
  bcc?: EmailAddress[];
  /**
   * The value is identical to the value of `header:Reply-To:asAddresses`.
   */
  replyTo?: EmailAddress[];
  /**
   * The value is identical to the value of `header:Subject:asText`.
   */
  subject?: string;
  /**
   * The value is identical to the value of `header:Date:asDate`.
   */
  sentAt?: string;
};

/**
 * [rfc8621 § 4.1.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.4)
 */
export type EmailBodyPart = {
  /**
   * Identifies this part uniquely within the Email.  This is scoped to
   * the `emailId` and has no meaning outside of the JMAP Email object
   * representation.  This is null if, and only if, the part is of type
   * `multipart/*`.
   */
  partId?: ID;
  /**
   * The id representing the raw octets of the contents of the part,
   * after decoding any known Content-Transfer-Encoding (as defined in
   * [RFC2045]), or null if, and only if, the part is of type
   * `multipart/*`.  Note that two parts may be transfer-encoded
   * differently but have the same blob id if their decoded octets are
   * identical and the server is using a secure hash of the data for
   * the blob id.  If the transfer encoding is unknown, it is treated
   * as though it had no transfer encoding.
   */
  blobId?: ID;
  /**
   * The size, in octets, of the raw data after content transfer
   * decoding (as referenced by the `blobId`, i.e., the number of
   * octets in the file the user would download).
   */
  size: number;
  /**
   * This is a list of all header fields in the part, in the order they
   * appear in the message.  The values are in Raw form.
   */
  headers: EmailHeader[];
  /**
   * This is the decoded "filename" parameter of the Content-Disposition
   * header field per [RFC2231], or (for compatibility with
   * existing systems) if not present, then it's the decoded `name`
   * parameter of the Content-Type header field per [RFC2047].
   */
  name?: string;
  /**
   * The value of the Content-Type header field of the part, if
   * present; otherwise, the implicit type as per the MIME standard
   * (`text/plain` or `message/rfc822` if inside a `multipart/digest`).
   * CFWS is removed and any parameters are stripped.
   */
  type: string;
  /**
   * The value of the charset parameter of the Content-Type header
   * field, if present, or null if the header field is present but not
   * of type `text/*`.  If there is no Content-Type header field, or it
   * exists and is of type `text/*` but has no charset parameter, this
   * is the implicit charset as per the MIME standard: `us-ascii`.
   */
  charset?: string;
  /**
   * The value of the Content-Disposition header field of the part, if
   * present; otherwise, it's null.  CFWS is removed and any parameters
   * are stripped.
   */
  disposition?: string;
  /**
   * The value of the Content-Id header field of the part, if present;
   * otherwise, it's null.  CFWS and surrounding angle brackets ("<>")
   * are removed.  This may be used to reference the content from
   * within a "text/html" body part [HTML](https://datatracker.ietf.org/doc/html/rfc8621#ref-HTML) using the "cid:" protocol,
   * as defined in [RFC2392].
   */
  cid?: string;
  /**
   * The list of language tags, as defined in [RFC3282], in the
   * Content-Language header field of the part, if present.
   */
  language?: string[];
  /**
   * The URI, as defined in [RFC2557], in the Content-Location header
   * field of the part, if present.
   */
  location?: string;
  /**
   * If the type is "multipart/*", this contains the body parts of each
   * child.
   */
  subParts?: EmailBodyPart[];
};

/**
 * [rfc8621 § 4.1.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.4)
 */
type EmailBodyPartFields = {
  /**
   * This is the full MIME structure of the message body, without
   * recursing into `message/rfc822` or `message/global` parts.  Note
   * that EmailBodyParts may have subParts if they are of type
   * `multipart/*`.
   *
   * @kind immutable
   */
  bodyStructure: EmailBodyPart;
  /**
   * This is a map of `partId` to an EmailBodyValue object for none,
   * some, or all `text/*` parts.  Which parts are included and whether
   * the value is truncated is determined by various arguments to
   * `Email/get` and `Email/parse`.
   *
   * @kind immutable
   */
  bodyValues: Record<ID, EmailBodyValue>;
  /**
   * A list of `text/plain`, `text/html`, `image/*`, `audio/*`, and/or
   * `video/*` parts to display (sequentially) as the message body,
   * with a preference for `text/plain` when alternative versions are
   * available.
   *
   * @kind immutable
   */
  textBody: EmailBodyPart[];
  /**
   * A list of `text/plain`, `text/html`, `image/*`, `audio/*`, and/or
   * `video/*` parts to display (sequentially) as the message body,
   * with a preference for `text/html` when alternative versions are
   * available.
   *
   * @kind immutable
   */
  htmlBody: EmailBodyPart[];
  /**
   * A list, traversing depth-first, of all parts in `bodyStructure`
   * that satisfy either of the following conditions:
   *
   *   - not of type `multipart/*` and not included in `textBody` or `htmlBody`
   *   - of type `image/*`, `audio/*`, or `video/*` and not in both `textBody` and `htmlBody`
   *
   * None of these parts include subParts, including `message/*` types.
   * Attached messages may be fetched using the `Email/parse` method
   * and the `blobId`.
   *
   * Note that a `text/html` body part [HTML] may reference image parts
   * in attachments by using `cid:` links to reference the Content-Id,
   * as defined in [RFC2392], or by referencing the Content-Location.
   *
   * @kind immutable
   */
  attachments: EmailBodyPart[];
  /**
   * This is true if there are one or more parts in the message that a
   * client UI should offer as downloadable.  A server SHOULD set
   * `hasAttachment` to true if the `attachments` list contains at least
   * one item that does not have `Content-Disposition: inline`.  The
   * server MAY ignore parts in this list that are processed
   * automatically in some way or are referenced as embedded images in
   * one of the `text/html` parts of the message.
   *
   * @kind immutable
   * @kind server-set
   */
  hasAttachment: boolean;
  /**
   * A plaintext fragment of the message body.  This is intended to be
   * shown as a preview line when listing messages in the mail store
   * and may be truncated when shown.  The server may choose which part
   * of the message to include in the preview; skipping quoted sections
   * and salutations and collapsing white space can result in a more
   * useful preview.
   *
   * This MUST NOT be more than 256 characters in length.
   *
   * As this is derived from the message content by the server, and the
   * algorithm for doing so could change over time, fetching this for
   * an Email a second time MAY return a different result.  However,
   * the previous value is not considered incorrect, and the change
   * SHOULD NOT cause the Email object to be considered as changed by
   * the server.
   *
   * @kind immutable
   * @kind server-set
   */
  preview: string;
};

/**
 * [rfc8621 § 4.1.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.4)
 */
export type EmailBodyValue = {
  /**
   * The value of the body part after decoding Content-Transfer-
   * Encoding and the Content-Type charset, if both known to the
   * server, and with any CRLF replaced with a single LF.  The
   * server MAY use heuristics to determine the charset to use for
   * decoding if the charset is unknown, no charset is given, or it
   * believes the charset given is incorrect.  Decoding is best
   * effort; the server SHOULD insert the unicode replacement
   * character (U+FFFD) and continue when a malformed section is
   * encountered.
   *
   * Note that due to the charset decoding and line ending
   * normalisation, the length of this string will probably not be
   * exactly the same as the "size" property on the corresponding
   * EmailBodyPart.
   */
  value: string;
  /**
   * This is true if malformed sections were found while decoding
   * the charset, the charset was unknown, or the content-transfer-
   * encoding was unknown.
   */
  isEncodingProblem: boolean;
  /**
   * This is true if the "value" has been truncated.
   */
  isTruncated: boolean;
};

/**
 * [rfc8621 § 4.4.1](https://datatracker.ietf.org/doc/html/rfc8621#section-4.4.1)
 */
export type EmailFilterCondition = FilterCondition<{
  /**
   * A Mailbox id.  An Email must be in this Mailbox to match the condition.
   */
  inMailbox: ID;
  /**
   * A list of Mailbox ids.  An Email must be in at least one Mailbox
   * not in this list to match the condition.  This is to allow
   * messages solely in trash/spam to be easily excluded from a search.
   */
  inMailboxOtherThan: ID[];
  /**
   * The `receivedAt` date-time of the Email must be before this date-time
   * to match the condition.
   */
  before: UTCDate;
  /**
   * The `receivedAt` date-time of the Email must be the same or after
   * this date-time to match the condition.
   */
  after: UTCDate;
  /**
   * The `size` property of the Email must be equal to or greater than
   * this number to match the condition.
   */
  minSize: number;
  /**
   * The `size` property of the Email must be less than this number to
   * match the condition.
   */
  maxSize: number;
  /**
   * All Emails (including this one) in the same Thread as this Email
   * must have the given keyword to match the condition.
   */
  allInThreadHaveKeyword: string;
  /**
   * At least one Email (possibly this one) in the same Thread as this
   * Email must have the given keyword to match the condition.
   */
  someInThreadHaveKeyword: string;
  /**
   * All Emails (including this one) in the same Thread as this Email
   * must *not* have the given keyword to match the condition
   */
  noneInThreadHaveKeyword: string;
  /**
   * This Email must have the given keyword to match the condition.
   */
  hasKeyword: string;
  /**
   * This Email must not have the given keyword to match the condition.
   */
  notKeyword: string;
  /**
   * The `hasAttachment` property of the Email must be identical to the
   * value given to match the condition.
   */
  hasAttachment: boolean;
  /**
   * Looks for the text in Emails.  The server MUST look up text in the
   * From, To, Cc, Bcc, and Subject header fields of the message and
   * SHOULD look inside any `text/*` or other body parts that may be
   * converted to text by the server.  The server MAY extend the search
   * to any additional textual property.
   */
  text: string;
  /**
   * Looks for the text in the From header field of the message.
   */
  from: string;
  /**
   * Looks for the text in the To header field of the message.
   */
  to: string;
  /**
   * Looks for the text in the Cc header field of the message.
   */
  cc: string;
  /**
   * Looks for the text in the Bcc header field of the message.
   */
  bcc: string;
  /**
   * Looks for the text in the Subject header field of the message.
   */
  subject: string;
  /**
   * Looks for the text in one of the body parts of the message.  The
   * server MAY exclude MIME body parts with content media types other
   * than `text/*` and `message/*` from consideration in search
   * matching.  Care should be taken to match based on the text content
   * actually presented to an end user by viewers for that media type
   * or otherwise identified as appropriate for search indexing.
   * Matching document metadata uninteresting to an end user (e.g.,
   * markup tag and attribute names) is undesirable.
   */
  body: string;
  /**
   * The array MUST contain either one or two elements.  The first
   * element is the name of the header field to match against.  The
   * second (optional) element is the text to look for in the header
   * field value.  If not supplied, the message matches simply if it
   * has a header field of the given name.
   */
  header: [string] | [string, string];
}>;

/**
 * [rfc8621 § 4.8](https://datatracker.ietf.org/doc/html/rfc8621#section-4.8)
 */
export type EmailImport = {
  /**
   * The id of the blob containing the raw message [RFC5322].
   */
  blobId: ID;
  /**
   * The ids of the Mailboxes to assign this Email to.  At least one
   * Mailbox MUST be given.
   */
  mailboxIds: Record<ID, boolean>;
  /**
   * The keywords to apply to the Email.
   */
  keywords: Record<Exclude<string, ForbiddenKeywordCharacters>, boolean>;
  /**
   * The `receivedAt` date to set on the Email.
   */
  receivedAt: UTCDate;
};

// =================================
// Search Snippets
// =================================

/**
 * [rfc8621 § 5](https://datatracker.ietf.org/doc/html/rfc8621#section-5)
 *
 * When doing a search on a "String" property, the client may wish to
 * show the relevant section of the body that matches the search as a
 * preview and to highlight any matching terms in both this and the
 * subject of the Email.  Search snippets represent this data.
 */
export type SearchSnippet = {
  /**
   * The Email id the snippet applies to.
   */
  emailId: ID;
  /**
   * If text from the filter matches the subject, this is the subject
   * of the Email with the following transformations:
   *
   *   1. Any instance of the following three characters MUST be
   *      replaced by an appropriate HTML entity: `&` (ampersand), `<`
   *      (less-than sign), and `>` (greater-than sign) [HTML](https://datatracker.ietf.org/doc/html/rfc8621#ref-HTML).  Other
   *      characters MAY also be replaced with an HTML entity form.
   *
   *   2. The matching words/phrases from the filter are wrapped in HTML
   *      `<mark></mark>` tags.
   *
   * If the subject does not match text from the filter, this property
   * is null.
   */
  subject?: string;
  /**
   * If text from the filter matches the plaintext or HTML body, this
   * is the relevant section of the body (converted to plaintext if
   * originally HTML), with the same transformations as the `subject`
   * property.  It MUST NOT be bigger than 255 octets in size.  If the
   * body does not contain a match for the text from the filter, this
   * property is null.
   */
  preview?: string;
};

// =================================
// Identities
// =================================

/**
 * [rfc8621 § 6](https://datatracker.ietf.org/doc/html/rfc8621#section-6)
 *
 * An Identity object stores information about an email address or
 * domain the user may send from.
 */
export type Identity = {
  /**
   * The id of the Identity.
   *
   * @kind immutable
   * @kind server-set
   */
  id: ID;
  /**
   * The `From` name the client SHOULD use when creating a new Email
   * from this Identity.
   */
  name: string;
  /**
   * The `From` email address the client MUST use when creating a new
   * Email from this Identity.  If the `mailbox` part of the address
   * (the section before the `@`) is the single character `*` (e.g.,
   * `*@example.com`), the client may use any valid address ending in
   * that domain (e.g., `foo@example.com`).
   *
   * @kind immutable
   */
  email: string;
  /**
   * The Reply-To value the client SHOULD set when creating a new Email
   * from this Identity.
   */
  replyTo?: EmailAddress[];
  /**
   * The Bcc value the client SHOULD set when creating a new Email from
   * this Identity.
   */
  bcc?: EmailAddress[];
  /**
   * A signature the client SHOULD insert into new plaintext messages
   * that will be sent from this Identity.  Clients MAY ignore this
   * and/or combine this with a client-specific signature preference.
   */
  textSignature: string;
  /**
   * A signature the client SHOULD insert into new HTML messages that
   * will be sent from this Identity.  This text MUST be an HTML
   * snippet to be inserted into the `<body></body>` section of the
   * HTML.  Clients MAY ignore this and/or combine this with a client-
   * specific signature preference.
   */
  htmlSignature: string;
  /**
   * Is the user allowed to delete this Identity?  Servers may wish to
   * set this to false for the user's username or other default
   * address.  Attempts to destroy an Identity with "mayDelete: false"
   * will be rejected with a standard "forbidden" SetError.
   *
   * @kind server-set
   */
  mayDelete: boolean;
};

export type IdentityCreate = Omit<Identity, "id" | "mayDelete">;

// =================================
// Email Submission
// =================================

/**
 * [rfc8621 § 7](https://datatracker.ietf.org/doc/html/rfc8621#section-7)
 */
export type EmailSubmission = {
  /**
   * The id of the EmailSubmission.
   *
   * @kind immutable
   * @kind server-set
   */
  id: ID;
  /**
   * The id of the Identity to associate with this submission.
   *
   * @kind immutable
   */
  identityId: ID;
  /**
   * The id of the Email to send.  The Email being sent does not have
   * to be a draft, for example, when "redirecting" an existing Email
   * to a different address.
   *
   * @kind immutable
   */
  emailId: ID;
  /**
   * The Thread id of the Email to send.  This is set by the server to
   * the `threadId` property of the Email referenced by the `emailId`.
   *
   * @kind immutable
   * @kind server-set
   */
  threadId: ID;
  /**
   * Information for use when sending via SMTP.
   *
   * @kind immutable
   */
  envelope?: Envelope;
  /**
   * The date the submission was/will be released for delivery.  If the
   * client successfully used FUTURERELEASE [RFC4865] with the
   * submission, this MUST be the time when the server will release the
   * message; otherwise, it MUST be the time the EmailSubmission was
   * created.
   *
   * @kind immutable
   * @kind server-set
   */
  sendAt: UTCDate;
  /**
   * This represents whether the submission may be canceled.  This is
   * server set on create.
   */
  undoStatus: UndoStatus;
  /**
   * This represents the delivery status for each of the submission's
   * recipients, if known.  This property MAY not be supported by all
   * servers, in which case it will remain null.  Servers that support
   * it SHOULD update the EmailSubmission object each time the status
   * of any of the recipients changes, even if some recipients are
   * still being retried.
   *
   * This value is a map from the email address of each recipient to a
   * DeliveryStatus object.
   *
   * @kind server-set
   */
  deliveryStatus?: Record<string, DeliveryStatus>;
  /**
   * A list of blob ids for DSNs [RFC3464] received for this
   * submission, in order of receipt, oldest first.  The blob is the
   * whole MIME message (with a top-level content-type of "multipart/
   * report"), as received.
   *
   * @kind server-set
   */
  dsnBlobIds: ID[];
  /**
   * A list of blob ids for MDNs [RFC8098] received for this
   * submission, in order of receipt, oldest first.  The blob is the
   * whole MIME message (with a top-level content-type of "multipart/
   * report"), as received.
   *
   * @kind server-set
   */
  mdnBlobIds: ID[];
};

export type EmailSubmissionCreate = Omit<
  EmailSubmission,
  "id" | "threadId" | "sendAt" | "deliveryStatus" | "dsnBlobIds" | "mdnBlobIds"
>;

/**
 * Information for use when sending via SMTP.
 */
export type Envelope = {
  /**
   * The email address to use as the return address in the SMTP
   * submission, plus any parameters to pass with the MAIL FROM
   * address.  The JMAP server MAY allow the address to be the empty
   * string.
   *
   * When a JMAP server performs an SMTP message submission, it MAY
   * use the same id string for the ENVID parameter [RFC3461] and
   * the EmailSubmission object id.  Servers that do this MAY
   * replace a client-provided value for ENVID with a server-
   * provided value.
   */
  mailFrom: EmailSubmissionAddress;
  /**
   * The email addresses to send the message to, and any RCPT TO
   * parameters to pass with the recipient.
   */
  rcptTo: EmailSubmissionAddress[];
};

export type EmailSubmissionAddress = {
  /**
   * The email address being represented by the object.  This is a
   * `Mailbox` as used in the Reverse-path or Forward-path of the
   * MAIL FROM or RCPT TO command in [RFC5321].
   */
  email: string;
  /**
   * Any parameters to send with the email address (either mail-
   * parameter or rcpt-parameter as appropriate, as specified in
   * [RFC5321]).  If supplied, each key in the object is a parameter
   * name, and the value is either the parameter value (type
   * "String") or null if the parameter does not take a value.  For
   * both name and value, any xtext or unitext encodings are removed
   * (see [RFC3461] and [RFC6533]) and JSON string encoding is
   * applied.
   */
  parameters?: Record<string, unknown>;
};

/**
 * This represents the delivery status for each of a submission's
 * recipients, if known.
 */
export type DeliveryStatus = {
  /**
   * The SMTP reply string returned for this recipient when the
   * server last tried to relay the message, or in a later Delivery
   * Status Notification (DSN, as defined in [RFC3464]) response for
   * the message.  This SHOULD be the response to the RCPT TO stage,
   * unless this was accepted and the message as a whole was
   * rejected at the end of the DATA stage, in which case the DATA
   * stage reply SHOULD be used instead.
   */
  smtpReply: string;
  /**
   * Represents whether the message has been successfully delivered
   * to the recipient.
   */
  delivered: "queued" | "yes" | "no" | "unknown";
  /**
   * Represents whether the message has been displayed to the
   * recipient.
   */
  displayed: "yes" | "unknown";
};

/**
 * Represents whether a message has been successfully delivered
 * to the recipient.
 */
export enum DeliveryStatusDelivered {
  /**
   * The message is in a local mail queue and the
   * status will change once it exits the local mail queues.  The
   * `smtpReply` property may still change.
   */
  Queued = "queued",
  /**
   * The message was successfully delivered to the mail
   * store of the recipient.  The `smtpReply` property is final.
   */
  Yes = "yes",
  /**
   * Delivery to the recipient permanently failed.  The
   * `smtpReply` property is final.
   */
  No = "no",
  /**
   * The final delivery status is unknown, (e.g., it
   * was relayed to an external machine and no further
   * information is available).  The `smtpReply` property may
   * still change if a DSN arrives.
   */
  Unknown = "unknown"
}

/**
 * Represents whether a message has been displayed to a
 * recipient.
 */
export enum DeliveryStatusDisplayed {
  /**
   * The display status is unknown.  This is the
   * initial value.
   */
  Unknown = "unknown",
  /**
   * The recipient's system claims the message content has
   * been displayed to the recipient.  Note that there is no
   * guarantee that the recipient has noticed, read, or
   * understood the content.
   */
  Yes = "yes"
}

/**
 * [rfc8621 § 7.3](https://datatracker.ietf.org/doc/html/rfc8621#section-7.3)
 */
export type EmailSubmissionFilterCondition = {
  /**
   * The EmailSubmission `identityId` property must be in this list to
   * match the condition.
   */
  identityIds: ID[];
  /**
   * The EmailSubmission `emailId` property must be in this list to
   * match the condition.
   */
  emailIds: ID[];
  /**
   * The EmailSubmission `threadId` property must be in this list to
   * match the condition.
   */
  threadIds: ID[];
  /**
   * The EmailSubmission `undoStatus` property must be identical to the
   * value given to match the condition.
   */
  undoStatus: UndoStatus;
  /**
   * The `sendAt` property of the EmailSubmission object must be before
   * this date-time to match the condition.
   */
  before: UTCDate;
  /**
   * The `sendAt` property of the EmailSubmission object must be the
   * same as or after this date-time to match the condition.
   */
  after: UTCDate;
};

/**
 * This represents whether a submission may be canceled.
 */
export enum UndoStatus {
  /**
   * It may be possible to cancel this submission.
   */
  Pending = "pending",
  /**
   * The message has been relayed to at least one recipient
   * in a manner that cannot be recalled.  It is no longer possible
   * to cancel this submission.
   */
  Final = "final",
  /**
   * The submission was canceled and will not be
   * delivered to any recipient.
   */
  Canceled = "canceled"
}

// =================================
// Vacation Response
// =================================

/**
 * [rfc8621 § 8](https://datatracker.ietf.org/doc/html/rfc8621#section-8)
 *
 * A vacation response sends an automatic reply when a message is
 * delivered to the mail store, informing the original sender that their
 * message may not be read for some time.
 *
 * The VacationResponse object represents the state of vacation-
 * response-related settings for an account.
 */
export type VacationResponse = {
  /**
   * The id of the object.  There is only ever one VacationResponse
   * object, and its id is `singleton`.
   *
   * @kind immutable
   * @kind server-set
   */
  id: "singleton";
  /**
   * Should a vacation response be sent if a message arrives between
   * the `fromDate` and `toDate`?
   */
  isEnabled: boolean;
  /**
   * If `isEnabled` is true, messages that arrive on or after this
   * date-time (but before the `toDate` if defined) should receive the
   * user's vacation response.  If null, the vacation response is
   * effective immediately.
   */
  fromDate?: UTCDate;
  /**
   * If `isEnabled` is true, messages that arrive before this date-time
   * (but on or after the `fromDate` if defined) should receive the
   * user's vacation response.  If null, the vacation response is
   * effective indefinitely.
   */
  toDate?: UTCDate;
  /**
   * The subject that will be used by the message sent in response to
   * messages when the vacation response is enabled.  If null, an
   * appropriate subject SHOULD be set by the server.
   */
  subject?: string;
  /**
   * The plaintext body to send in response to messages when the
   * vacation response is enabled.  If this is null, the server SHOULD
   * generate a plaintext body part from the "htmlBody" when sending
   * vacation responses but MAY choose to send the response as HTML
   * only.  If both "textBody" and "htmlBody" are null, an appropriate
   * default body SHOULD be generated for responses by the server.
   */
  textBody?: string;
  /**
   * The HTML body to send in response to messages when the vacation
   * response is enabled.  If this is null, the server MAY choose to
   * generate an HTML body part from the "textBody" when sending
   * vacation responses or MAY choose to send the response as plaintext
   * only.
   */
  htmlBody?: string;
};

export type VacationResponseCreate = Omit<VacationResponse, "id">;
