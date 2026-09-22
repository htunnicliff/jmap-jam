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
    export interface Contract {
      input: Input;
      output: Output<this["input"]>;
    }
  }

  export namespace Set {
    export type Input = SetArguments<IdentityCreate>;
    export type Output<A> = SetResponse<Identity, A>;
    export interface Contract {
      input: Input;
      output: Output<this["input"]>;
    }
  }

  export namespace Changes {
    export type Input = ChangesArguments;
    export type Output = ChangesResponse;
    export interface Contract {
      input: Input;
      output: Output;
    }
  }
}
