import type { Split } from "type-fest";
import type { Email } from "../jmap-mail/email.ts";
import type { CopyArguments, CopyResponse } from "./methods/copy.ts";
import type { GetArguments, GetResponse } from "./methods/get.ts";

/**
 * Interface for JMAP entities. To add an entity, augment
 * this interface. For example:
 *
 * ```ts
 * declare module 'jmap-rfc-types' {
 *   interface $Entities {
 *     MyEntity: "uri:my:entity:capability";
 *   }
 * }
 */
// export interface $Entities {}

// oxlint-disable-next-line no-unused-vars
export interface Operations<Args> {}

export type Entities = Split<keyof Operations<never>, "/">[0];
export type Entity = keyof $Entities;

export interface $Operations<Args> {
  Email: {
    get: {
      args: GetArguments<Email>;
      response: GetResponse<Email, Args>;
    };
    copy: {
      args: CopyArguments<Email>;
      response: CopyResponse<Email>;
    };
  };
}

declare function request<
  Entity extends keyof $Operations<never>,
  Op extends keyof $Operations<never>[Entity],
  Args extends $Operations<never>[Entity][Op] extends { args: infer A }
    ? A
    : never,
  Res extends $Operations<Args>[Entity][Op] extends { response: infer R }
    ? R
    : never
>(entity: Entity, op: Op, args: Args): Res;

const {
  list: [email]
} = request("Email", "get", {
  accountId: "a",
  ids: ["1"],
  properties: ["messageId"]
});
