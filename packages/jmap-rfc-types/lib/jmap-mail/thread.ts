import type { ID } from "../jmap/primitives.ts";

declare module "../jmap/augmented.ts" {
  interface Entities {
    Thread: true;
  }
}

/**
 * [rfc8621 § 3](https://datatracker.ietf.org/doc/html/rfc8621#section-3)
 *
 * Replies are grouped together with the original message to form a
 * Thread.  In JMAP, a Thread is simply a flat list of Emails, ordered
 * by date.
 */
export interface Thread {
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
}
