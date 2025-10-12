/**
 * [rfc8620 § 7.3](https://datatracker.ietf.org/doc/html/rfc8620#section-7.3)
 */
export type EventSourceArguments = {
  /**
   * The `types` argument MUST be either:
   *
   *   - A comma-separated list of type names, e.g.,
   *     `Email,CalendarEvent`.  The server MUST only push changes for
   *     the types in this list.
   *
   *   - The single character: `*`.  Changes to all types are pushed.
   */
  types: string;
  closeafter: EventSourceCloseAfterType | `${EventSourceCloseAfterType}`;
  /**
   * A positive integer value representing a length of time in
   * seconds, e.g., `300`.  If non-zero, the server MUST send an event
   * called `ping` whenever this time elapses since the previous event
   * was sent.  This MUST NOT set a new event id.  If the value is `0`,
   * the server MUST NOT send ping events.
   *
   * The server MAY modify a requested ping interval to be subject to a
   * minimum and/or maximum value.  For interoperability, servers MUST
   * NOT have a minimum allowed value higher than 30 or a maximum
   * allowed value less than 300.
   *
   * The data for the ping event MUST be a JSON object containing an
   * `interval` property, the value (type "UnsignedInt") being the
   * interval in seconds the server is using to send pings (this may be
   * different to the requested value if the server clamped it to be
   * within a min/max value).
   *
   * Clients can monitor for the ping event to help determine when the
   * closeafter mode may be required.
   */
  ping: string;
};

export enum EventSourceCloseAfterType {
  /**
   * The server MUST end the HTTP response after pushing a
   * state event.  This can be used by clients in environments where
   * buffering proxies prevent the pushed data from arriving
   * immediately, or indeed at all, when operating in the usual
   * mode.
   */
  State = "state",
  /**
   * The connection is persisted by the server as a standard
   * event-source resource.
   */
  No = "no"
}
