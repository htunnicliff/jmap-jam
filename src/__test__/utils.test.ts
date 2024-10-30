import { describe, expect, it } from "vitest";
import { allHeaderFields, headerField } from "../utils.ts";

describe("headerField", () => {
  it("passes name and form arguments into string", () => {
    expect(headerField("Some-Header", "Addresses")).toBe(
      "header:Some-Header:asAddresses"
    );
  });
});

describe("allHeaderFields", () => {
  it("applies correct suffix", async () => {
    expect(allHeaderFields("Some-Header", "Addresses")).toBe(
      "header:Some-Header:asAddresses:all"
    );
  });
});
