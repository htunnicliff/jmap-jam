import type { Email, EmailAddress, WithoutHeaders } from "jmap-rfc-types";
import { describe, expectTypeOf, it } from "vitest";
import { JamClient } from "../client.ts";

const jam = new JamClient({
  bearerToken: "example",
  sessionUrl: "https://example.com/jmap"
});

describe("Email", () => {
  it("includes explicit headers when requested", async () => {
    // Sanity check for a few known fields
    expectTypeOf<
      "headers" | "from" | "to" | "header:From:asRaw" | "header:From:asRaw:all"
    >().toExtend<keyof Email>();

    const [{ list }] = await jam.api.Email.get({
      accountId: "123",
      properties: [
        "header:Resent-To:asAddresses",
        "header:Resent-To:asAddresses:all",
        "from",
        "preview",
        "receivedAt"
      ]
    });

    const [email] = list;

    expectTypeOf(email).toEqualTypeOf<{
      "header:Resent-To:asAddresses": Array<EmailAddress>;
      "header:Resent-To:asAddresses:all": Array<Array<EmailAddress>>;
      from: Array<EmailAddress> | undefined;
      preview: string;
      receivedAt: string;
    }>();
  });

  it("excludes `header:` fields when not requested", async () => {
    const [{ list }] = await jam.api.Email.get({
      accountId: "123"
    });

    const [email] = list;

    expectTypeOf(email).toEqualTypeOf<WithoutHeaders<Email>>();
  });

  it.todo("EmailBodyPart fields are filtered by `bodyProperties`", async () => {
    /* const [
      { noBodyProperties, withBodyProperties, withBodyPropertiesAndProperties }
    ] = await jam.requestMany((r) => {
      const noBodyProperties = r.Email.get({
        accountId: "123"
      });

      const withBodyProperties = r.Email.get({
        accountId: "123",
        bodyProperties: ["blobId", "subParts", "location"]
      });

      const withBodyPropertiesAndProperties = r.Email.get({
        accountId: "123",
        properties: ["textBody", "htmlBody", "bodyStructure"],
        bodyProperties: ["blobId", "subParts", "location"]
      });

      return {
        noBodyProperties,
        withBodyProperties,
        withBodyPropertiesAndProperties
      };
    });

    type FilteredEmailBodyPart = Pick<
      EmailBodyPart,
      "blobId" | "subParts" | "location"
    >;

    const [emailNoFilters] = noBodyProperties.list;
    const [emailFilteredBody] = withBodyProperties.list;
    const [emailFilteredBodyAndProps] = withBodyPropertiesAndProperties.list;

    // Email without filters uses unmodified `EmailBodyPart`
    {
      const { bodyStructure, textBody, htmlBody } = emailNoFilters;
      expectTypeOf(bodyStructure).toEqualTypeOf<EmailBodyPart>();
      expectTypeOf(textBody).toEqualTypeOf<EmailBodyPart[]>();
      expectTypeOf(htmlBody).toEqualTypeOf<EmailBodyPart[]>();
    }

    // Email with `bodyProperties` filters uses filtered `EmailBodyPart`
    {
      const { bodyStructure, textBody, htmlBody } = emailFilteredBody;
      expectTypeOf(bodyStructure).toEqualTypeOf<FilteredEmailBodyPart>();
      expectTypeOf(textBody).toEqualTypeOf<FilteredEmailBodyPart[]>();
      expectTypeOf(htmlBody).toEqualTypeOf<FilteredEmailBodyPart[]>();
    }

    // Email with `bodyProperties` and `properties` filters still uses filtered `EmailBodyPart`
    {
      const { bodyStructure, textBody, htmlBody } = emailFilteredBodyAndProps;
      expectTypeOf(bodyStructure).toEqualTypeOf<FilteredEmailBodyPart>();
      expectTypeOf(textBody).toEqualTypeOf<FilteredEmailBodyPart[]>();
      expectTypeOf(htmlBody).toEqualTypeOf<FilteredEmailBodyPart[]>();
    } */
  });
});
