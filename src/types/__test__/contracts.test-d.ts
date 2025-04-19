import { it } from "vitest";
import { JamClient } from "../../client.ts";

const jam = new JamClient({
  bearerToken: "example",
  sessionUrl: "https://example.com/jmap",
})

it('accepts partial of model for creation', async () => {
  await jam.api.Mailbox.set({
    accountId: "123",
    create: {
      something: {
        name: "test",
      },
    },
  });
})

it("requires at least one property when creating", async () => {
  await jam.api.Mailbox.set({
    accountId: "123",
    create: {
      // @ts-expect-error at least one property is required
      something: {},
    },
  });

});
