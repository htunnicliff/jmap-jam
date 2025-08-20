import { describe, expectTypeOf, it } from "vitest";
import { JamClient } from "../../client.ts";
import {
  AllowedHeadersByParsedForm,
  Email,
  EmailAddress,
  EmailAddressGroup,
  HeaderField,
  HeaderFieldValue,
  IsValidHeader,
  KnownHeaders,
  WithoutHeaders
} from "../jmap-mail.ts";

const jam = new JamClient({
  bearerToken: "example",
  sessionUrl: "https://example.com/jmap",
  automaticAccountId: false
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

describe("WithoutHeaders", () => {
  it("removes all `header:` fields", () => {
    type Input = {
      foo: string;
      bar: number[];
      "header:From:asRaw": string;
      "header:To:asAddresses": Array<EmailAddress>;
      "header:Subject:asText": string;
      "header:234231245@!@#$!#%": unknown;
    };

    type Result = WithoutHeaders<Input>;

    type Expected = {
      foo: string;
      bar: number[];
    };

    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});

describe("HeaderField", () => {
  it("has correct return type", () => {
    expectTypeOf<
      HeaderField<"Some-Header", "Addresses">
    >().toEqualTypeOf<`header:Some-Header:asAddresses`>();

    expectTypeOf<
      HeaderField<"From", "Raw">
    >().toEqualTypeOf<`header:From:asRaw`>();

    expectTypeOf<
      HeaderField<"Some-Header", "Addresses", { all: true }>
    >().toEqualTypeOf<`header:Some-Header:asAddresses:all`>();

    expectTypeOf<
      HeaderField<"From", "Raw", { all: true }>
    >().toEqualTypeOf<`header:From:asRaw:all`>();
  });
});

describe("HeaderFieldValue", () => {
  describe("Raw", () => {
    it("parses as string", () => {
      type Result = HeaderFieldValue<"header:From:asRaw">;
      type Expected = string;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("parses :all as Array<string>", () => {
      type Result = HeaderFieldValue<"header:From:asRaw:all">;
      type Expected = Array<string>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("Text", () => {
    it("parses as string", () => {
      type Result = HeaderFieldValue<"header:From:asText">;
      type Expected = string;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("parses :all as Array<string>", () => {
      type Result = HeaderFieldValue<"header:From:asText:all">;
      type Expected = Array<string>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("Addresses", () => {
    it("parses as Array<EmailAddress>", () => {
      type Result = HeaderFieldValue<"header:From:asAddresses">;
      type Expected = Array<EmailAddress>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("parses :all as Array<Array<EmailAddress>>", () => {
      type Result = HeaderFieldValue<"header:From:asAddresses:all">;
      type Expected = Array<Array<EmailAddress>>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("GroupedAddresses", () => {
    it("parses as Array<EmailAddressGroup>", () => {
      type Result = HeaderFieldValue<"header:From:asGroupedAddresses">;
      type Expected = Array<EmailAddressGroup>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("parses :all as Array<Array<EmailAddressGroup>>", () => {
      type Result = HeaderFieldValue<"header:From:asGroupedAddresses:all">;
      type Expected = Array<Array<EmailAddressGroup>>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("MessageIds", () => {
    it("parses as Array<string | undefined>", () => {
      type Result = HeaderFieldValue<"header:From:asMessageIds">;
      type Expected = Array<string> | undefined;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("parses :all as Array<Array<string | undefined>>", () => {
      type Result = HeaderFieldValue<"header:From:asMessageIds:all">;
      type Expected = Array<Array<string> | undefined>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("Date", () => {
    it("parses as string | undefined", () => {
      type Result = HeaderFieldValue<"header:From:asDate">;
      type Expected = string | undefined;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("parses :all as Array<string>", () => {
      type Result = HeaderFieldValue<"header:From:asDate:all">;
      type Expected = Array<string | undefined>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("URLs", () => {
    it("parses as Array<string> | undefined", () => {
      type Result = HeaderFieldValue<"header:From:asURLs">;
      type Expected = Array<string> | undefined;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("parses :all as Array<Array<string> | undefined>", () => {
      type Result = HeaderFieldValue<"header:From:asURLs:all">;
      type Expected = Array<Array<string> | undefined>;
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });
});

describe("IsValidHeader", () => {
  it("treats non-confirming headers as invalid", () => {
    expectTypeOf<
      | IsValidHeader<`Foo`>
      | IsValidHeader<`Foo:header`>
      | IsValidHeader<`header::::`>
      | IsValidHeader<`headers:Subject:asText`>
    >().toEqualTypeOf<"broken">();
  });

  it("treats raw headers as valid", () => {
    expectTypeOf<
      // Known
      | IsValidHeader<`header:From:asRaw`>
      // Known All
      | IsValidHeader<`header:From:asRaw:all`>
      // Unknown
      | IsValidHeader<`header:Unknown:asRaw`>
      // Unknown All
      | IsValidHeader<`header:Unknown:asRaw:all`>
    >().toEqualTypeOf<"raw">();
  });

  it("permits any format for unknown headers", () => {
    expectTypeOf<
      | IsValidHeader<`header:Unknown:asText`>
      | IsValidHeader<`header:Unknown:asAddresses`>
      | IsValidHeader<`header:Unknown:asGroupedAddresses`>
      | IsValidHeader<`header:Unknown:asMessageIds`>
      | IsValidHeader<`header:Unknown:asDate`>
      | IsValidHeader<`header:Unknown:asURLs`>
    >().toEqualTypeOf<"unknown">();
  });

  it("permits known headers with correct formats", () => {
    type ValidCombos = {
      [ParsedForm in keyof AllowedHeadersByParsedForm as `${ParsedForm}:${AllowedHeadersByParsedForm[ParsedForm]}`]: `header:${AllowedHeadersByParsedForm[ParsedForm]}:as${ParsedForm}`;
    };

    expectTypeOf<
      IsValidHeader<ValidCombos[keyof ValidCombos]>
    >().toEqualTypeOf<"valid">();

    // Sanity check for random known header combinations
    expectTypeOf<
      | "header:Subject:asText"
      | "header:Comments:asText"
      | "header:Resent-From:asAddresses"
      | "header:List-Id:asText"
    >().toExtend<ValidCombos[keyof ValidCombos]>();
  });

  it("treats known headers with missing or incorrect formats as invalid", () => {
    type InvalidCombos = {
      [Key in keyof AllowedHeadersByParsedForm]: `header:${Exclude<KnownHeaders, AllowedHeadersByParsedForm[Key]>}:as${Key}`;
    };

    expectTypeOf<
      IsValidHeader<InvalidCombos[keyof InvalidCombos]>
    >().toEqualTypeOf<"invalid">();

    // Sanity check for random invalid header combinations
    expectTypeOf<
      | "header:Subject:asAddresses"
      | "header:Comments:asGroupedAddresses"
      | "header:Resent-From:asMessageIds"
      | "header:List-Id:asDate"
    >().toExtend<InvalidCombos[keyof InvalidCombos]>();
  });
});
