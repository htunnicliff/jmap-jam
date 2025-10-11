import type { Mailbox, SetError } from "jmap-rfc-types";
import { describe, expectTypeOf, it } from "vitest";
import { JamClient } from "../client.ts";

const jam = new JamClient({
  bearerToken: "example",
  sessionUrl: "https://example.com/jmap"
});

describe("set creation", () => {
  it("response includes client ids", async () => {
    const [result] = await jam.api.Mailbox.set({
      accountId: "123",
      create: {
        something: {
          name: "test"
        }
      },
      update: {
        foo: {
          name: "bar"
        }
      }
    });

    expectTypeOf(result.created).toExtend<{
      something?: Mailbox;
    }>();
    expectTypeOf(result.notCreated).toEqualTypeOf<{
      something?: SetError;
    } | null>();

    expectTypeOf(result.updated).toExtend<{
      foo?: Mailbox | null | undefined;
    }>();
    expectTypeOf(result.notUpdated).toEqualTypeOf<{
      foo?: SetError;
    } | null>();
  });

  it("response uses null when an operation is not used", async () => {
    const [result] = await jam.api.Mailbox.set({
      accountId: "123",
      create: {}
    });

    expectTypeOf(result.created).not.toEqualTypeOf<null>();
    expectTypeOf(result.notCreated).not.toEqualTypeOf<null>();

    expectTypeOf(result.updated).toEqualTypeOf<null>();
    expectTypeOf(result.notUpdated).toEqualTypeOf<null>();

    expectTypeOf(result.destroyed).toEqualTypeOf<null>();
    expectTypeOf(result.notDestroyed).toEqualTypeOf<null>();
  });

  it("requires at least one property if create operation is defined", async () => {
    await jam.api.Mailbox.set({
      accountId: "123",
      create: {
        // @ts-expect-error at least one property is required
        something: {}
      }
    });
  });

  it("requires at least one of create, update, or destroy", async () => {
    // @ts-expect-error at least one of create, update, or destroy is required
    await jam.api.Mailbox.set({
      accountId: "123"
    });

    await jam.api.Mailbox.set({
      accountId: "123",
      create: {}
    });

    await jam.api.Mailbox.set({
      accountId: "123",
      create: {},
      update: {},
      destroy: []
    });
  });
});
