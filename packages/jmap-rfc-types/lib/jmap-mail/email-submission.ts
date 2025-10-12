import type { ID, UTCDate } from "../jmap/primitives.ts";

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
