import type { FilterCondition, ID, UTCDate } from "./jmap.ts";

/**
 * JMAP Contacts
 *
 * [rfc9610](https://datatracker.ietf.org/doc/html/rfc9610)
 */

export namespace JMAPContacts {
  export type Entities = {
    AddressBook: AddressBook;
    ContactCard: ContactCard;
  };

  export type Entity = keyof Entities;
}

// =================================
// AddressBooks
// =================================

/**
 * [rfc9610 § 2](https://datatracker.ietf.org/doc/html/rfc9610#section-2)
 *
 * An AddressBook is a named collection of ContactCards. All ContactCards are
 * associated with one or more AddressBooks.
 */
export type AddressBook = {
  /**
   * The id of the AddressBook.
   *
   * @kind immutable
   * @kind server-set
   */
  id: ID;
  /**
   * The user-visible name of the AddressBook. This MUST NOT be the empty
   * string and MUST NOT be greater than 255 octets in size when encoded as UTF-8.
   */
  name: string;
  /**
   * An optional long-form description of the AddressBook that provides
   * context in shared environments where users need more than just the name.
   */
  description: string | null;
  /**
   * Defines the sort order of AddressBooks when presented in the client's UI
   * so it is consistent between devices. The number MUST be an integer in the
   * range 0 <= sortOrder < 2^31.
   */
  sortOrder: number;
  /**
   * This SHOULD be true for exactly one AddressBook in any account and MUST
   * NOT be true for more than one AddressBook within an account.
   *
   * @kind server-set
   */
  isDefault: boolean;
  /**
   * True if the user has indicated they wish to see this AddressBook in their
   * client.
   */
  isSubscribed: boolean;
  /**
   * A map of the Principal id to rights for Principals this AddressBook is
   * shared with. The Principal to which this AddressBook belongs MUST NOT be
   * in this set. This is null if the AddressBook is not shared with anyone or
   * if the server does not support RFC 9670.
   */
  shareWith: Record<ID, AddressBookRights> | null;
  /**
   * The set of access rights the user has in relation to this AddressBook.
   *
   * @kind server-set
   */
  myRights: AddressBookRights;
};

export type AddressBookCreate = Omit<
  AddressBook,
  // Fields set by server
  | "id"
  | "isDefault"
  | "myRights"
>;

/**
 * [rfc9610 § 2](https://datatracker.ietf.org/doc/html/rfc9610#section-2)
 *
 * An AddressBookRights object has the following properties.
 */
export type AddressBookRights = {
  /**
   * The user may fetch the ContactCards in this AddressBook.
   */
  mayRead: boolean;
  /**
   * The user may create, modify, or destroy all ContactCards in this
   * AddressBook, or move them to or from this AddressBook.
   */
  mayWrite: boolean;
  /**
   * The user may modify the "shareWith" property for this AddressBook.
   */
  mayShare: boolean;
  /**
   * The user may delete the AddressBook itself.
   */
  mayDelete: boolean;
};

// =================================
// ContactCards
// =================================

/**
 * [rfc9610 § 3](https://datatracker.ietf.org/doc/html/rfc9610#section-3)
 *
 * A ContactCard object contains information about a person, company, or other
 * entity, or represents a group of such entities. It is a JSContact Card
 * object as defined in RFC 9553 with additional JMAP-specific properties.
 */
export type ContactCard = JSContactCard & {
  /**
   * The id of the ContactCard. The "id" property MAY be different to the
   * ContactCard's "uid" property. However, there MUST NOT be more than one
   * ContactCard with the same uid in an Account.
   *
   * @kind immutable
   * @kind server-set
   */
  id: ID;
  /**
   * The set of AddressBook ids that this ContactCard belongs to. A card MUST
   * belong to at least one AddressBook at all times (until it is destroyed).
   * The set is represented as an object, with each key being an AddressBook id.
   * The value for each key in the object MUST be true.
   */
  addressBookIds: Record<ID, true>;
};

export type ContactCardCreate = Omit<ContactCard, "id">;

/**
 * Base JSContact Card object as defined in RFC 9553.
 * This is a simplified type definition covering the most common properties.
 * For full RFC 9553 compliance, you may need to extend this type.
 */
export type JSContactCard = {
  /**
   * The version of the JSContact specification this card conforms to.
   */
  "@type"?: "Card";
  /**
   * The version of JSContact.
   */
  version?: string;
  /**
   * A globally unique identifier for this card.
   */
  uid?: string;
  /**
   * The kind of entity this card represents.
   */
  kind?: "individual" | "group" | "org" | "location" | "device" | "application";
  /**
   * The creation date-time of this card.
   */
  created?: UTCDate;
  /**
   * The last update date-time of this card.
   */
  updated?: UTCDate;
  /**
   * The language tag of the primary language for this card.
   */
  language?: string;
  /**
   * UIDs of other cards that are members of this group (for kind="group").
   */
  members?: Record<string, boolean>;
  /**
   * The name components of the entity.
   */
  name?: Name;
  /**
   * Alternative names or nicknames.
   */
  nicknames?: Record<string, Nickname>;
  /**
   * Organizations the entity is affiliated with.
   */
  organizations?: Record<string, Organization>;
  /**
   * Job titles of the entity.
   */
  titles?: Record<string, Title>;
  /**
   * Email addresses.
   */
  emails?: Record<string, ContactEmailAddress>;
  /**
   * Phone numbers.
   */
  phones?: Record<string, Phone>;
  /**
   * Online service accounts.
   */
  onlineServices?: Record<string, OnlineService>;
  /**
   * Preferred contact methods.
   */
  preferredContactMethod?: string;
  /**
   * Postal addresses.
   */
  addresses?: Record<string, Address>;
  /**
   * Anniversary dates.
   */
  anniversaries?: Record<string, Anniversary>;
  /**
   * Personal information.
   */
  personalInfo?: Record<string, PersonalInfo>;
  /**
   * Notes or additional information.
   */
  notes?: Record<string, Note>;
  /**
   * Categories or tags.
   */
  categories?: Record<string, boolean>;
  /**
   * Photos or avatars.
   */
  photos?: Record<string, Media>;
  /**
   * Related links or URLs.
   */
  links?: Record<string, Link>;
  /**
   * Keywords for indexing and searching.
   */
  keywords?: Record<string, boolean>;
  /**
   * Localized versions of this card.
   */
  localizations?: Record<string, ContactPatchObject>;
};

/**
 * Name components as defined in RFC 9553.
 */
export type Name = {
  /**
   * Name components that make up the full name.
   */
  components?: NameComponent[];
  /**
   * The full name as a single string.
   */
  full?: string;
  /**
   * Sort order string for this name.
   */
  sortAs?: Record<string, string>;
  /**
   * Default separator for joining name components.
   */
  defaultSeparator?: string;
  /**
   * Whether the components are ordered.
   */
  isOrdered?: boolean;
  /**
   * Phonetic representation.
   */
  phoneticScript?: string;
  /**
   * Phonetic system used.
   */
  phoneticSystem?: string;
};

export type NameComponent = {
  /**
   * The kind of name component.
   */
  kind?:
    | "prefix"
    | "given"
    | "given2"
    | "surname"
    | "surname2"
    | "suffix"
    | "credential";
  /**
   * The value of this name component.
   */
  value: string;
  /**
   * Phonetic representation.
   */
  phonetic?: string;
};

export type Nickname = {
  /**
   * The nickname value.
   */
  name: string;
  /**
   * Contexts in which this nickname applies.
   */
  contexts?: Record<string, boolean>;
  /**
   * Preference order.
   */
  pref?: number;
};

export type Organization = {
  /**
   * The organization name.
   */
  name: string;
  /**
   * Units or divisions within the organization.
   */
  units?: string[];
  /**
   * Sort order string.
   */
  sortAs?: string;
  /**
   * Contexts in which this organization applies.
   */
  contexts?: Record<string, boolean>;
};

export type Title = {
  /**
   * The job title or role.
   */
  title: string;
  /**
   * The organization this title is with.
   */
  organizationId?: string;
  /**
   * Contexts in which this title applies.
   */
  contexts?: Record<string, boolean>;
};

export type ContactEmailAddress = {
  /**
   * The email address.
   */
  address: string;
  /**
   * A label for this email address.
   */
  label?: string;
  /**
   * Contexts in which this email applies.
   */
  contexts?: Record<string, boolean>;
  /**
   * Preference order.
   */
  pref?: number;
};

export type Phone = {
  /**
   * The phone number.
   */
  number: string;
  /**
   * A label for this phone number.
   */
  label?: string;
  /**
   * Features of this phone number.
   */
  features?: Record<string, boolean>;
  /**
   * Contexts in which this phone applies.
   */
  contexts?: Record<string, boolean>;
  /**
   * Preference order.
   */
  pref?: number;
};

export type OnlineService = {
  /**
   * The service name (e.g., "twitter", "skype").
   */
  service?: string;
  /**
   * The URI for this service.
   */
  uri?: string;
  /**
   * The username or handle.
   */
  user?: string;
  /**
   * A label for this service.
   */
  label?: string;
  /**
   * Contexts in which this service applies.
   */
  contexts?: Record<string, boolean>;
  /**
   * Preference order.
   */
  pref?: number;
};

export type Address = {
  /**
   * Address components.
   */
  components?: AddressComponent[];
  /**
   * The full address as a single string.
   */
  full?: string;
  /**
   * Contexts in which this address applies.
   */
  contexts?: Record<string, boolean>;
  /**
   * Preference order.
   */
  pref?: number;
  /**
   * Coordinates of this address.
   */
  coordinates?: string;
  /**
   * Time zone of this address.
   */
  timeZone?: string;
};

export type AddressComponent = {
  /**
   * The kind of address component.
   */
  kind?:
    | "room"
    | "apartment"
    | "floor"
    | "building"
    | "number"
    | "name"
    | "block"
    | "subdistrict"
    | "district"
    | "locality"
    | "region"
    | "postcode"
    | "country"
    | "direction"
    | "landmark"
    | "postOfficeBox"
    | "separator";
  /**
   * The value of this address component.
   */
  value: string;
};

export type Anniversary = {
  /**
   * The type of anniversary.
   */
  kind?: "birth" | "death" | "wedding" | string;
  /**
   * The date of the anniversary.
   */
  date: PartialDate;
  /**
   * The place associated with this anniversary.
   */
  place?: Address;
};

export type PartialDate = {
  /**
   * Year (4 digits).
   */
  year?: number;
  /**
   * Month (1-12).
   */
  month?: number;
  /**
   * Day (1-31).
   */
  day?: number;
};

export type PersonalInfo = {
  /**
   * The kind of personal information.
   */
  kind: "expertise" | "hobby" | "interest" | string;
  /**
   * The value of this personal information.
   */
  value: string;
  /**
   * Level of expertise (1-3).
   */
  level?: "beginner" | "average" | "expert";
};

export type Note = {
  /**
   * The note text.
   */
  note: string;
  /**
   * The author of this note.
   */
  author?: string;
  /**
   * Creation date of this note.
   */
  created?: UTCDate;
};

/**
 * Media object for photos, logos, and other media.
 *
 * [rfc9610 § 3](https://datatracker.ietf.org/doc/html/rfc9610#section-3)
 */
export type Media = {
  /**
   * The kind of media.
   */
  kind?: "photo" | "logo" | "sound";
  /**
   * The URI of the media resource.
   */
  uri?: string;
  /**
   * An id for the Blob representing the binary contents of the resource
   * (JMAP-specific property).
   */
  blobId?: ID;
  /**
   * The media type.
   */
  mediaType?: string;
  /**
   * Contexts in which this media applies.
   */
  contexts?: Record<string, boolean>;
  /**
   * Preference order.
   */
  pref?: number;
};

export type Link = {
  /**
   * The URI of the link.
   */
  uri: string;
  /**
   * The kind of resource.
   */
  kind?: "contact" | "other";
  /**
   * Media type of the linked resource.
   */
  mediaType?: string;
  /**
   * Label for this link.
   */
  label?: string;
  /**
   * Contexts in which this link applies.
   */
  contexts?: Record<string, boolean>;
  /**
   * Preference order.
   */
  pref?: number;
};

export type ContactPatchObject = Record<string, unknown>;

// =================================
// Filter Conditions
// =================================

/**
 * [rfc9610 § 3.3.1](https://datatracker.ietf.org/doc/html/rfc9610#section-3.3.1)
 *
 * Filter conditions for ContactCard/query.
 */
export type ContactCardFilterCondition = FilterCondition<{
  /**
   * An AddressBook id. A card must be in this address book to match the condition.
   */
  inAddressBook?: ID;
  /**
   * A card must have this string exactly as its uid to match.
   */
  uid?: string;
  /**
   * A card must have a "members" property that contains this string as one of
   * the uids in the set to match.
   */
  hasMember?: string;
  /**
   * A card must have a "kind" property that equals this string exactly to match.
   */
  kind?: string;
  /**
   * The "created" date-time of the ContactCard must be before this date-time.
   */
  createdBefore?: UTCDate;
  /**
   * The "created" date-time of the ContactCard must be the same or after this date-time.
   */
  createdAfter?: UTCDate;
  /**
   * The "updated" date-time of the ContactCard must be before this date-time.
   */
  updatedBefore?: UTCDate;
  /**
   * The "updated" date-time of the ContactCard must be the same or after this date-time.
   */
  updatedAfter?: UTCDate;
  /**
   * A card matches if the text matches with text in the card.
   */
  text?: string;
  /**
   * Matches the value of any NameComponent in the "name" property or the "full" property.
   */
  name?: string;
  /**
   * Matches a NameComponent with kind "given".
   */
  "name/given"?: string;
  /**
   * Matches a NameComponent with kind "surname".
   */
  "name/surname"?: string;
  /**
   * Matches a NameComponent with kind "surname2".
   */
  "name/surname2"?: string;
  /**
   * Matches the "name" of any Nickname.
   */
  nickname?: string;
  /**
   * Matches the "name" of any Organization.
   */
  organization?: string;
  /**
   * Matches the "address" or "label" of any EmailAddress.
   */
  email?: string;
  /**
   * Matches the "number" or "label" of any Phone.
   */
  phone?: string;
  /**
   * Matches the "service", "uri", "user", or "label" of any OnlineService.
   */
  onlineService?: string;
  /**
   * Matches the value of any AddressComponent or the "full" property in addresses.
   */
  address?: string;
  /**
   * Matches the "note" of any Note.
   */
  note?: string;
}>;

// =================================
// Capability
// =================================

/**
 * [rfc9610 § 1.4.1](https://datatracker.ietf.org/doc/html/rfc9610#section-1.4.1)
 *
 * Capability for urn:ietf:params:jmap:contacts
 */
export type ContactsCapability = {
  /**
   * The maximum number of AddressBooks that can be assigned to a single
   * ContactCard object. This MUST be an integer >= 1, or null for no limit.
   */
  maxAddressBooksPerCard: number | null;
  /**
   * The user may create an AddressBook in this account if, and only if, this is true.
   */
  mayCreateAddressBook: boolean;
};
