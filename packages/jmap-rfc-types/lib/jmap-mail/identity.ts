import type { ID } from "../jmap/primitives.ts";
import type { EmailAddress } from "./email.ts";

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
