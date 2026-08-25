import type { Identity, IdentityCreate } from "../jmap-mail.ts";
import type {
  ChangesArguments,
  ChangesResponse,
  GetArguments,
  GetResponse,
  SetArguments,
  SetResponse
} from "../jmap.ts";

export declare namespace IdentityContracts {
  export namespace Get {
    export type Input = GetArguments<Identity>;
    export type Output<A> = GetResponse<Identity, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Set {
    export type Input = SetArguments<IdentityCreate>;
    export type Output<A> = SetResponse<Identity, A>;
    export type Method = <const A extends Input>(args: A) => Output<A>;
  }

  export namespace Changes {
    export type Input = ChangesArguments;
    export type Output = ChangesResponse;
    export type Method = (args: Input) => Output;
  }
}
