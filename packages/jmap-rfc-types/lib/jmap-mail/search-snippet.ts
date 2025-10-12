import type { ID } from "../jmap/primitives.ts";

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
