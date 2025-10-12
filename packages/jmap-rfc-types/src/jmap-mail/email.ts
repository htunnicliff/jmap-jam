import type { Simplify } from "type-fest";
import type { ID, UTCDate } from "../jmap/primitives.ts";
import type { FilterCondition } from "../jmap/filters.ts";

declare module "../jmap/augmented.ts" {
  interface Entities {
    Email: true;
  }
}

/**
 * [rfc8621 § 4](https://datatracker.ietf.org/doc/html/rfc8621#section-4)
 *
 * An *Email* object is a representation of a message [rfc5322](https://datatracker.ietf.org/doc/html/rfc5322), which
 * allows clients to avoid the complexities of MIME parsing, transfer
 * encoding, and character encoding.
 */
export type Email = Simplify<
  EmailMetadataFields &
    EmailAutomaticallyParsedHeaderFields &
    EmailBodyPartFields &
    PossibleHeaderFields
>;

export type WithoutHeaders<T> = Omit<T, `header:${string}`>;

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
interface EmailMetadataFields {
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
  keywords: Record<string, boolean>;
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
}

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

/**
 * [rfc8621 § 4.1.2.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.3)
 */
export interface EmailAddress {
  name?: string;
  email: string;
}

/**
 * [rfc8621 § 4.1.2.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.4)
 */
export interface EmailAddressGroup {
  name?: string;
  addresses: EmailAddress[];
}

/**
 * [rfc8621 § 4.1.2](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2)
 *
 * Header field properties are derived from the message header fields
 * [rfc5322](https://datatracker.ietf.org/doc/html/rfc5322) [rfc6532](https://datatracker.ietf.org/doc/html/rfc6532).  All header fields may be fetched in a raw form.
 * Some header fields may also be fetched in a parsed form.  The
 * structured form that may be fetched depends on the header.
 */
export interface HeaderParsedForm {
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
}

type _AllowedHeadersByParsedForm<
  T extends Record<Exclude<keyof HeaderParsedForm, "Raw">, string>
> = T;

export type AllowedHeadersByParsedForm = _AllowedHeadersByParsedForm<{
  /**
   * [rfc8621 § 4.1.2.2](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.2)
   */
  Text: "Subject" | "Comments" | "Keywords" | "List-Id";
  /**
   * [rfc8621 § 4.1.2.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.3)
   */
  Addresses:
    | "From"
    | "Sender"
    | "Reply-To"
    | "To"
    | "Cc"
    | "Bcc"
    | "Resent-From"
    | "Resent-Sender"
    | "Resent-Reply-To"
    | "Resent-To"
    | "Resent-Cc"
    | "Resent-Bcc";
  /**
   * [rfc8621 § 4.1.2.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.4)
   */
  GroupedAddresses: AllowedHeadersByParsedForm["Addresses"];
  /**
   * [rfc8621 § 4.1.2.5](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.5)
   */
  MessageIds: "Message-ID" | "In-Reply-To" | "References" | "Resent-Message-ID";
  /**
   * [rfc8621 § 4.1.2.6](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.6)
   */
  Date: "Date" | "Resent-Date";
  /**
   * [rfc8621 § 4.1.2.7](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.2.7)
   */
  URLs:
    | "List-Help"
    | "List-Unsubscribe"
    | "List-Subscribe"
    | "List-Post"
    | "List-Owner"
    | "List-Archive";
}>;

export type KnownHeaders =
  AllowedHeadersByParsedForm[keyof AllowedHeadersByParsedForm];

export type IsValidHeader<FullHeader extends string> = FullHeader extends
  | `header:${infer Header}:as${infer ParsedForm extends keyof HeaderParsedForm}`
  | `header:${infer Header}:as${infer ParsedForm extends keyof HeaderParsedForm}:all`
  ? "Raw" extends ParsedForm
    ? "raw" // ✅ Raw is always valid
    : Header extends KnownHeaders
      ? ParsedForm extends keyof AllowedHeadersByParsedForm
        ? Header extends AllowedHeadersByParsedForm[ParsedForm]
          ? "valid" // ✅ Valid combination
          : "invalid" // ❌ Invalid combination
        : never // ❌ Not possible but required by TS
      : "unknown" // ✅ Unknown headers are always valid
  : "broken"; // ❌ Invalid header structure

/**
 * [rfc8621 § 4.1.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.3)
 */
export type HeaderField<
  Name extends string,
  Form extends keyof HeaderParsedForm,
  Options extends { all: boolean } = { all: false }
> = Options["all"] extends true
  ? `header:${Name}:as${Form}:all`
  : `header:${Name}:as${Form}`;

export type HeaderFieldValue<T> =
  T extends `header:${infer _Name}:as${infer ParsedForm extends keyof HeaderParsedForm}:all`
    ? Simplify<Array<HeaderParsedForm[ParsedForm]>>
    : T extends `header:${infer _Name}:as${infer ParsedForm extends keyof HeaderParsedForm}`
      ? Simplify<HeaderParsedForm[ParsedForm]>
      : never;

/**
 * [rfc8621 § 4.1.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.3)
 */
export interface EmailHeader {
  /**
   * The header "field name" as defined in [RFC5322], with the same
   * capitalization that it has in the message.
   */
  name: string;
  /**
   * The header "field value" as defined in [RFC5322], in Raw form.
   */
  value: string;
}

/**
 * [rfc8621 § 4.1.3](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.3)
 *
 * @kind immutable
 */
interface EmailAutomaticallyParsedHeaderFields {
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
}

type PossibleHeaderFields = Simplify<
  {
    [Key in keyof AllowedHeadersByParsedForm as HeaderField<
      AllowedHeadersByParsedForm[Key],
      Key,
      { all: true }
    >]: HeaderFieldValue<
      HeaderField<AllowedHeadersByParsedForm[Key], Key, { all: true }>
    >;
  } & {
    [Key in `header:${KnownHeaders}:asRaw`]: HeaderFieldValue<Key>;
  } & {
    [Key in keyof AllowedHeadersByParsedForm as HeaderField<
      AllowedHeadersByParsedForm[Key],
      Key
    >]: HeaderFieldValue<HeaderField<AllowedHeadersByParsedForm[Key], Key>>;
  } & {
    [Key in `header:${KnownHeaders}:asRaw:all`]: HeaderFieldValue<Key>;
  } & {
    [Key in HeaderField<string, keyof HeaderParsedForm>]: HeaderFieldValue<Key>;
  } & {
    [Key in HeaderField<
      string,
      keyof HeaderParsedForm,
      { all: true }
    >]: HeaderFieldValue<Key>;
  }
>;

/**
 * [rfc8621 § 4.1.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.4)
 */
export interface EmailBodyPart {
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
  headers?: EmailHeader[];
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
}

/**
 * [rfc8621 § 4.1.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.4)
 */
interface EmailBodyPartFields {
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
}

/**
 * [rfc8621 § 4.1.4](https://datatracker.ietf.org/doc/html/rfc8621#section-4.1.4)
 */
export interface EmailBodyValue {
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
}

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
export interface EmailImport {
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
  keywords: Record<string, boolean>;
  /**
   * The `receivedAt` date to set on the Email.
   */
  receivedAt: UTCDate;
}
