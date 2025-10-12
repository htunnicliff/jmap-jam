import type { ID } from "../jmap.ts";

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
