import { describe, expectTypeOf, it } from "vitest";
import { allHeaderFields, headerField } from "../utils.ts";

describe("headerField", () => {
  it("has correct return type", () => {
    expectTypeOf(
      headerField("Some-Header", "Addresses")
    ).toEqualTypeOf<`header:Some-Header:asAddresses`>();

    expectTypeOf(
      headerField("From", "Raw")
    ).toEqualTypeOf<`header:From:asRaw`>();
  });
});

describe("allHeaderFields", () => {
  it("has correct return type", () => {
    expectTypeOf(
      allHeaderFields("Some-Header", "Addresses")
    ).toEqualTypeOf<`header:Some-Header:asAddresses:all`>();

    expectTypeOf(
      allHeaderFields("From", "Raw")
    ).toEqualTypeOf<`header:From:asRaw:all`>();
  });
});
