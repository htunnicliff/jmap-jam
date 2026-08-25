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
    type Input = Omit<GetArguments<PushSubscription>, "accountId">;
    type Output<A> = Omit<GetResponse<PushSubscription, A>, "state" | "accountId">;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Set {
    type Input = Omit<SetArguments<PushSubscriptionCreate>, "accountId" | "ifInState">;
    type Output<A> = Omit<SetResponse<PushSubscription, A>, "accountId" | "oldState" | "newState">;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }
}
