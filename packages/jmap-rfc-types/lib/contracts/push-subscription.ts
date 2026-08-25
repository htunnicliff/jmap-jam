import type {
  GetArguments,
  GetResponse,
  PushSubscriptionCreate,
  SetArguments,
  SetResponse
} from "../jmap.ts";
import type { PushSubscription } from "../jmap.ts";

export declare namespace PushSubscriptionContracts {
  export namespace Get {
    export type Input = Omit<GetArguments<PushSubscription>, "accountId">;
    export type Output<A> = Omit<GetResponse<PushSubscription, A>, "state" | "accountId">;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Set {
    export type Input = Omit<SetArguments<PushSubscriptionCreate>, "accountId" | "ifInState">;
    export type Output<A> = Omit<
      SetResponse<PushSubscription, A>,
      "accountId" | "oldState" | "newState"
    >;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }
}
