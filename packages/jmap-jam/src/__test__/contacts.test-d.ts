import type {
  AddressBook,
  ContactCard,
  CopySetError,
  QueryResponse,
  SetError
} from "jmap-rfc-types";
import { describe, expectTypeOf, it } from "vitest";
import { JamClient } from "../client.ts";

const jam = new JamClient({
  bearerToken: "example",
  sessionUrl: "https://example.com/jmap"
});

describe("AddressBook methods", () => {
  it("AddressBook/get returns address books", async () => {
    const [result] = await jam.api.AddressBook.get({
      accountId: "account-1",
      ids: ["book-1"]
    });

    expectTypeOf(result.list).toEqualTypeOf<ReadonlyArray<AddressBook>>();
    expectTypeOf(result.state).toBeString();
    expectTypeOf(result.notFound).toEqualTypeOf<ReadonlyArray<string>>();
  });

  it("AddressBook/get filters by properties", async () => {
    const [result] = await jam.api.AddressBook.get({
      accountId: "account-1",
      properties: ["name", "sortOrder"]
    });

    expectTypeOf(result.list).toEqualTypeOf<
      ReadonlyArray<Pick<AddressBook, "name" | "sortOrder">>
    >();
  });

  it("AddressBook/set supports onSuccessSetIsDefault", async () => {
    const [result] = await jam.api.AddressBook.set({
      accountId: "account-1",
      create: {
        newBook: {
          name: "Personal Contacts"
        }
      },
      onSuccessSetIsDefault: "#newBook"
    });

    expectTypeOf(result.created).toExtend<{
      newBook?: AddressBook;
    }>();
    expectTypeOf(result.notCreated).toEqualTypeOf<{
      newBook?: SetError;
    } | null>();
  });

  it("AddressBook/set supports onDestroyRemoveContents", async () => {
    await jam.api.AddressBook.set({
      accountId: "account-1",
      destroy: ["book-1"],
      onDestroyRemoveContents: true
    });
  });

  it("AddressBook/changes returns standard changes response", async () => {
    const [result] = await jam.api.AddressBook.changes({
      accountId: "account-1",
      sinceState: "state-1"
    });

    expectTypeOf(result.oldState).toBeString();
    expectTypeOf(result.newState).toBeString();
    expectTypeOf(result.created).toEqualTypeOf<string[]>();
    expectTypeOf(result.updated).toEqualTypeOf<string[]>();
    expectTypeOf(result.destroyed).toEqualTypeOf<string[]>();
  });
});

describe("ContactCard methods", () => {
  it("ContactCard/get returns contact cards", async () => {
    const [result] = await jam.api.ContactCard.get({
      accountId: "account-1",
      ids: ["contact-1"]
    });

    expectTypeOf(result.list).toEqualTypeOf<ReadonlyArray<ContactCard>>();
    expectTypeOf(result.state).toBeString();
  });

  it("ContactCard/set creates and updates contacts", async () => {
    const [result] = await jam.api.ContactCard.set({
      accountId: "account-1",
      create: {
        newContact: {
          addressBookIds: {
            "book-1": true
          },
          name: {
            components: [
              { kind: "given", value: "Jane" },
              { kind: "surname", value: "Doe" }
            ]
          },
          emails: {
            email1: {
              address: "jane@example.com",
              contexts: { work: true }
            }
          }
        }
      }
    });

    expectTypeOf(result.created).toExtend<{
      newContact?: ContactCard;
    }>();
    expectTypeOf(result.notCreated).toEqualTypeOf<{
      newContact?: SetError;
    } | null>();
  });

  it("ContactCard/query supports filtering", async () => {
    const [result] = await jam.api.ContactCard.query({
      accountId: "account-1",
      filter: {
        inAddressBook: "book-1",
        email: "jane@example.com",
        name: "Jane",
        "name/given": "Jane",
        text: "engineer"
      }
    });

    expectTypeOf(result).toEqualTypeOf<QueryResponse>();
  });

  it("ContactCard/copy copies contacts between accounts", async () => {
    const [result] = await jam.api.ContactCard.copy({
      fromAccountId: "account-1",
      accountId: "account-2",
      create: {
        copyContact: {
          id: "contact-1",
          addressBookIds: {
            "book-2": true
          }
        }
      }
    });

    expectTypeOf(result.created).toEqualTypeOf<
      Record<string, ContactCard> | null
    >();
    expectTypeOf(result.notCreated).toEqualTypeOf<
      Record<string, CopySetError> | null
    >();
  });
});

describe("Contacts capability", () => {
  it("includes contacts capability in known capabilities", () => {
    expectTypeOf(jam.capabilities.get("AddressBook")).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(jam.capabilities.get("ContactCard")).toEqualTypeOf<
      string | undefined
    >();
  });
});
