import type { ID, UTCDate } from "../primitives.ts";

declare module "../augmented.ts" {
  interface $Entities {
    PushSubscription: true;
  }
}

/**
 * [rfc8620 § 7.1](https://datatracker.ietf.org/doc/html/rfc8620#section-7.1)
 */
export interface StateChange {
  "@type": "StateChange";
  changed: Record<ID, TypeState>;
}

export type TypeState = Record<string, string>;

/**
 * [rfc8620 § 7.2](https://datatracker.ietf.org/doc/html/rfc8620#section-7.2)
 */
export interface PushSubscription {
  /**
   * The id of the push subscription.
   *
   * @kind immutable
   * @kind server-set
   */
  id: ID;
  /**
   * An id that uniquely identifies the client + device it is running
   * on.  The purpose of this is to allow clients to identify which
   * PushSubscription objects they created even if they lose their
   * local state, so they can revoke or update them.  This string MUST
   * be different on different devices and be different from apps from
   * other vendors.  It SHOULD be easy to regenerate and not depend on
   * persisted state.  It is RECOMMENDED to use a secure hash of a
   * string that contains:
   *
   *   1. A unique identifier associated with the device where the JMAP
   *      client is running, normally supplied by the device's operating
   *      system.
   *
   *   2. A custom vendor/app id, including a domain controlled by the
   *      vendor of the JMAP client.
   *
   * To protect the privacy of the user, the `deviceClientId` id MUST NOT
   * contain an unobfuscated device id.
   *
   * @kind immutable
   */
  deviceClientId: string;
  /**
   * An absolute URL where the JMAP server will POST the data for the
   * push message.  This MUST begin with `https://`.
   *
   * @kind immutable
   */
  url: string;
  /**
   * Client-generated encryption keys.  If supplied, the server MUST
   * use them as specified in [RFC8291] to encrypt all data sent to the
   * push subscription.
   *
   * @kind immutable
   */
  keys?: {
    /**
     * The P-256 Elliptic Curve Diffie-Hellman (ECDH) public key as
     * described in [RFC8291], encoded in URL-safe base64
     * representation as defined in [RFC4648].
     */
    p256dh: string;
    /**
     * The authentication secret as described in [RFC8291], encoded in
     * URL-safe base64 representation as defined in [RFC4648].
     */
    auth: string;
  };
  /**
   * This MUST be null (or omitted) when the subscription is created.
   * The JMAP server then generates a verification code and sends it in
   * a push message, and the client updates the PushSubscription object
   * with the code; see Section 7.2.2 for details.
   */
  verificationCode?: string;
  /**
   * The time this push subscription expires.  If specified, the JMAP
   * server MUST NOT make further requests to this resource after this
   * time.  It MAY automatically destroy the push subscription at or
   * after this time.
   *
   * The server MAY choose to set an expiry if none is given by the
   * client or modify the expiry time given by the client to a shorter
   * duration.
   */
  expires?: UTCDate;
  /**
   * A list of types the client is interested in (using the same names
   * as the keys in the TypeState object defined in the previous
   * section).  A StateChange notification will only be sent if the
   * data for one of these types changes.  Other types are omitted from
   * the TypeState object.  If null, changes will be pushed for all
   * types.
   */
  types?: string[];
}

export type PushSubscriptionCreate = Omit<PushSubscription, "id">;

/**
 * [rfc8620 § 7.2.2](https://datatracker.ietf.org/doc/html/rfc8620#section-7.2.2)
 */
export interface PushVerification {
  "@type": "PushVerification";
  pushSubscriptionId: string;
  verificationCode: string;
}
