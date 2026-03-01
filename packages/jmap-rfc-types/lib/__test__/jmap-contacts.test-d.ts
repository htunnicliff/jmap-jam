import { describe, expectTypeOf, it } from "vitest";
import type {
  AddressBook,
  ContactCard,
  ContactCardFilterCondition,
  ContactEmailAddress,
  Entities
} from "../jmap-contacts.ts";

describe("JMAPContacts types", () => {
  it("defines correct entity types", () => {
    expectTypeOf<Entities>().toEqualTypeOf<{
      AddressBook: AddressBook;
      ContactCard: ContactCard;
    }>();
  });

  it("AddressBook has required properties", () => {
    const addressBook: AddressBook = {
      id: "test-id",
      name: "Personal",
      description: null,
      sortOrder: 0,
      isDefault: true,
      isSubscribed: true,
      shareWith: null,
      myRights: {
        mayRead: true,
        mayWrite: true,
        mayShare: false,
        mayDelete: false
      }
    };

    expectTypeOf(addressBook.id).toBeString();
    expectTypeOf(addressBook.name).toBeString();
    expectTypeOf(addressBook.sortOrder).toBeNumber();
  });

  it("ContactCard has JSContact properties plus JMAP extensions", () => {
    const contact: ContactCard = {
      id: "contact-1",
      addressBookIds: {
        "addressbook-1": true
      },
      name: {
        components: [
          { kind: "given", value: "Jane" },
          { kind: "surname", value: "Doe" }
        ]
      }
    };

    expectTypeOf(contact.id).toBeString();
    expectTypeOf(contact.addressBookIds).toEqualTypeOf<Record<string, true>>();
  });

  it("ContactEmailAddress is distinct from mail EmailAddress", () => {
    const email: ContactEmailAddress = {
      address: "test@example.com",
      label: "Work",
      contexts: { work: true },
      pref: 1
    };

    expectTypeOf(email.address).toBeString();
    expectTypeOf(email.label).toEqualTypeOf<string | undefined>();
  });

  it("ContactCardFilterCondition supports all search fields", () => {
    const filter: ContactCardFilterCondition = {
      inAddressBook: "book-1",
      email: "test@example.com",
      name: "Jane",
      "name/given": "Jane",
      text: "software engineer"
    };

    expectTypeOf(filter.inAddressBook).toEqualTypeOf<string | undefined>();
    expectTypeOf(filter.email).toEqualTypeOf<string | undefined>();
  });
});
