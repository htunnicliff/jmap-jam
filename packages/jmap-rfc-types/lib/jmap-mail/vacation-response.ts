import type { UTCDate } from "../jmap/primitives.ts";

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
export interface VacationResponse {
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
}

export type VacationResponseCreate = Omit<VacationResponse, "id">;
